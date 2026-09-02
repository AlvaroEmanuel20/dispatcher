import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from 'generated/prisma/client';

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

  private generateApiKeyAndPrefix() {
    const keyAlias = this.configService.getOrThrow<string>('API_KEY_ALIAS');
    const keyPepper = this.configService.getOrThrow<string>('API_KEY_PEPPER');

    const apiKey = `${keyAlias}${randomBytes(32).toString('hex')}`;

    const keyHash = createHash('sha256')
      .update(`${keyPepper}${apiKey}`)
      .digest('hex');

    return {
      apiKey,
      keyHash,
      keyPrefix: apiKey.slice(0, 24),
    };
  }
}
