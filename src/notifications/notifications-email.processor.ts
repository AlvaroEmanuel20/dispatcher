import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import QUEUES from '../infrastructure/queue/queues';
import { NotificationsService } from './notifications.service';
import { EmailNotificationJobData } from './notifications.types';

@Processor(QUEUES.EMAIL)
export class NotificationsEmailProcessor extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<EmailNotificationJobData>) {
    return await this.notificationsService.sendEmailNotificationFromJob(job);
  }
}
