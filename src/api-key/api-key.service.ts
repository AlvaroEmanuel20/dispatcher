import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Prisma } from '../generated/prisma/client';
import ms, { StringValue } from 'ms';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getApiKeys(applicationId: string) {
    return await this.prisma.apiKey.findMany({
      where: {
        applicationId,
      },
      omit: {
        keyHash: true,
      },
    });
  }

  async getApiKeyById(applicationId: string, apiKeyId: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        applicationId,
        id: apiKeyId,
      },
      omit: {
        keyHash: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  async getApiKeyByPrefix(applicationId: string, keyPrefix: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        applicationId,
        keyPrefix,
      },
      omit: {
        keyHash: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  async createApiKey(applicationId: string, data: CreateApiKeyDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.isActive) {
      throw new ConflictException(
        'Cannot create API key for inactive application',
      );
    }

    const { apiKey, keyHash, keyPrefix } = this.generateApiKeyAndPrefix();

    try {
      const newApiKey = await this.prisma.apiKey.create({
        data: {
          ...data,
          keyHash,
          keyPrefix,
          applicationId,
        },
        omit: {
          keyHash: true,
        },
      });

      return {
        key: apiKey,
        keyNotice:
          'This is the only time you will see the API key. Please copy it now and store it securely.',
        ...newApiKey,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'API key prefix collision. Please try again.',
          );
        }
      }

      throw error;
    }
  }

  async updateApiKey(
    applicationId: string,
    apiKeyId: string,
    data: UpdateApiKeyDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.isActive) {
      throw new ConflictException(
        'Cannot update API key for inactive application',
      );
    }

    return await this.prisma.apiKey.update({
      where: {
        applicationId,
        id: apiKeyId,
      },
      data,
      omit: {
        keyHash: true,
      },
    });
  }

  async isApiKeyValid(key: string) {
    const apiKeyResult = await this.prisma.apiKey.findUnique({
      where: {
        keyPrefix: this.getApiKeyPrefix(key),
      },
      include: {
        application: true,
      },
    });

    if (!apiKeyResult) {
      throw new NotFoundException('API key not found');
    }

    if (!apiKeyResult.application.isActive || apiKeyResult.revokedAt) {
      throw new UnauthorizedException('API key inactive or revoked');
    }

    if (apiKeyResult.expiresAt && apiKeyResult.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    const keyHash = this.hashKey(key);
    const isValid = this.compareHashBuffers(keyHash, apiKeyResult.keyHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }

    return {
      isValid: true,
      applicationId: apiKeyResult.applicationId,
      apiKeyId: apiKeyResult.id,
    };
  }

  async updateLastUsed(apiKeyId: string) {
    const apiKeyLastUsedUpdateInterval =
      this.configService.getOrThrow<StringValue>(
        'API_KEY_LAST_USED_UPDATE_INTERVAL_MS',
      );

    const now = new Date();
    const threshold = new Date(
      now.getTime() - ms(apiKeyLastUsedUpdateInterval),
    );

    try {
      return await this.prisma.apiKey.updateMany({
        where: {
          id: apiKeyId,
          OR: [{ lastUsedAt: null }, { lastUsedAt: { lt: threshold } }],
        },
        data: {
          lastUsedAt: now,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(error.message);
        }
      }

      throw error;
    }
  }

  private getApiKeyPrefix(apiKey: string) {
    const apiKeyPrefixLength = this.configService.getOrThrow<number>(
      'API_KEY_PREFIX_LENGTH',
    );

    return apiKey.slice(0, apiKeyPrefixLength);
  }

  private compareHashBuffers(
    keyHashFromRequest: string,
    keyHashFromDb: string,
  ) {
    const buffer1 = Buffer.from(keyHashFromRequest, 'hex');
    const buffer2 = Buffer.from(keyHashFromDb, 'hex');

    if (buffer1.length !== buffer2.length) {
      return false;
    }

    return timingSafeEqual(buffer1, buffer2);
  }

  private generateApiKeyAndPrefix() {
    const keyAlias = this.configService.getOrThrow<string>('API_KEY_ALIAS');
    const apiKey = `${keyAlias}${randomBytes(32).toString('hex')}`;

    return {
      apiKey,
      keyHash: this.hashKey(apiKey),
      keyPrefix: this.getApiKeyPrefix(apiKey),
    };
  }

  private hashKey(key: string) {
    const keyPepper = this.configService.getOrThrow<string>('API_KEY_PEPPER');
    return createHash('sha256').update(`${keyPepper}${key}`).digest('hex');
  }
}
