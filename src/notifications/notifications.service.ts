import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { EmailProvider } from '../infrastructure/email/email.provider';
import QUEUES from '../infrastructure/queue/queues';
import { EmailNotificationJobData } from './notifications.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProvider: EmailProvider,
    @InjectQueue(QUEUES.EMAIL)
    private readonly emailQueue: Queue<EmailNotificationJobData>,
  ) {}

  async sendEmailNotificationFromJob(job: Job<EmailNotificationJobData>) {}
}
