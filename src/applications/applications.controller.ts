import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { AdminRoles } from '../common/admin-roles.decorator';
import { AdminRolesGuard } from '../common/admin-roles.guard';
import { ApplicationsService } from './applications.service';
import {
  ApplicationIdDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './applications.dto';
import { Throttle, seconds } from '@nestjs/throttler';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN', 'OPERATOR')
  @UseGuards(AdminRolesGuard)
  async getApplications() {
    return await this.applicationsService.getApplications();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN', 'OPERATOR')
  @UseGuards(AdminRolesGuard)
  async getApplicationById(@Param() { id }: ApplicationIdDto) {
    return await this.applicationsService.getApplicationById(id);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Post()
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async createApplication(@Body() data: CreateApplicationDto) {
    return await this.applicationsService.createApplication(data);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async updateApplication(
    @Param() { id }: ApplicationIdDto,
    @Body() data: UpdateApplicationDto,
  ) {
    return await this.applicationsService.updateApplication(id, data);
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Patch('inactivate/:id')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  @HttpCode(200)
  async inactivateApplication(@Param() { id }: ApplicationIdDto) {
    return await this.applicationsService.updateApplication(id, {
      isActive: false,
    });
  }

  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Patch('activate/:id')
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  @HttpCode(200)
  async activateApplication(@Param() { id }: ApplicationIdDto) {
    return await this.applicationsService.updateApplication(id, {
      isActive: true,
    });
  }
}
