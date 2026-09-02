import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
