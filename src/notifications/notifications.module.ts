import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { EmailProvider } from 'src/infrastructure/email/email.provider';
import getEmailProvider from 'src/infrastructure/email/get-email-provider';
import { QueuesModule } from 'src/infrastructure/queue/queue.module';
import { NotificationsService } from './notifications.service';
import { NotificationsEmailProcessor } from './notifications-email.processor';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule, QueuesModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsEmailProcessor,
    { provide: EmailProvider, useClass: getEmailProvider() },
  ],
})
export class NotificationsModule {}
