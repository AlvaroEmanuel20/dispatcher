import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { AdminUserModule } from 'src/admin/user/admin-user.module';

@Module({
  imports: [DatabaseModule, AdminUserModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
