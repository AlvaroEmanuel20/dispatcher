import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { AdminUserModule } from '../admin/user/admin-user.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [DatabaseModule, AdminUserModule, ApplicationsModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
})
export class ApiKeyModule {}
