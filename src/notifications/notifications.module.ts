import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { EmailProvider } from '../infrastructure/email/email.provider';
import getEmailProvider from '../infrastructure/email/get-email-provider';
import { QueuesModule } from '../infrastructure/queue/queue.module';
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
