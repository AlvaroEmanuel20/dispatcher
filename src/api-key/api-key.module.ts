import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { AdminUserModule } from 'src/admin/user/admin-user.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  imports: [DatabaseModule, AdminUserModule, ApplicationsModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
})
export class ApiKeyModule {}
