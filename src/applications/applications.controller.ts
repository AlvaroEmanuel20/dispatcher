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
import { AdminAuthGuard } from 'src/common/admin-auth.guard';
import { AdminRoles } from 'src/common/admin-roles.decorator';
import { AdminRolesGuard } from 'src/common/admin-roles.guard';
import { ApplicationsService } from './applications.service';
import {
  ApplicationIdDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './applications.dto';

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

  @Post()
  @UseGuards(AdminAuthGuard)
  @AdminRoles('ADMIN')
  @UseGuards(AdminRolesGuard)
  async createApplication(@Body() data: CreateApplicationDto) {
    return await this.applicationsService.createApplication(data);
  }

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
