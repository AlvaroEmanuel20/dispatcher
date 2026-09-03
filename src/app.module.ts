import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getPinoLoggerConfig } from './infrastructure/config/pino-logger.config';
import { BullModule } from '@nestjs/bullmq';
import { getBullQueueConfig } from './infrastructure/config/bullmq.config';
import { BullBoardModule } from '@bull-board/nestjs';
import { getBullBoardConfig } from './infrastructure/config/bull-board.config';
import { NotificationsModule } from './notifications/notifications.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { ApplicationsModule } from './applications/applications.module';
import { AdminUserModule } from './admin/user/admin-user.module';
import { AdminAuthModule } from './admin/auth/admin-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getPinoLoggerConfig,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getBullQueueConfig,
    }),
    BullBoardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getBullBoardConfig,
    }),
    NotificationsModule,
    ApiKeyModule,
    ApplicationsModule,
    AdminUserModule,
    AdminAuthModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
