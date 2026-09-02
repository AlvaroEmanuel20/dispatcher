import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { AdminAuthGuard } from 'src/common/admin-auth.guard';
import { AdminRoles } from 'src/common/admin-roles.decorator';
import { AdminRolesGuard } from 'src/common/admin-roles.guard';
import {
  ApiKeyApplicationIdDto,
  ApiKeyIdApplicationIdDto,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from './api-key.dto';

@Controller('applications/:applicationId/api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN', 'OPERATOR')
  @UseGuards(AdminRolesGuard)
  async getApiKeys(@Param() { applicationId }: ApiKeyApplicationIdDto) {
    return await this.apiKeyService.getApiKeys(applicationId);
  }

  @Get(':apiKeyId')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN', 'OPERATOR')
  @UseGuards(AdminRolesGuard)
  async getApiKeyById(
    @Param() { applicationId, apiKeyId }: ApiKeyIdApplicationIdDto,
  ) {
    return await this.apiKeyService.getApiKeyById(applicationId, apiKeyId);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async createApiKey(
    @Param() { applicationId }: ApiKeyApplicationIdDto,
    @Body() data: CreateApiKeyDto,
  ) {
    return await this.apiKeyService.createApiKey(applicationId, data);
  }

  @Patch(':apiKeyId')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async updateApiKey(
    @Param() { applicationId, apiKeyId }: ApiKeyIdApplicationIdDto,
    @Body() data: UpdateApiKeyDto,
  ) {
    return await this.apiKeyService.updateApiKey(applicationId, apiKeyId, data);
  }

  @Patch(':apiKeyId/revoke')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async revokeApiKey(
    @Param() { applicationId, apiKeyId }: ApiKeyIdApplicationIdDto,
  ) {
    return await this.apiKeyService.updateApiKey(applicationId, apiKeyId, {
      revokedAt: new Date(),
    });
  }
}
