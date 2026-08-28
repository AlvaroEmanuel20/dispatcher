import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from '../email.provider';
import { SendEmailParams, SendEmailReturn } from '../email-provider.types';

@Injectable()
export class MailpitEmailProvider implements EmailProvider {
  private readonly logger = new Logger(MailpitEmailProvider.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILPIT_HOST') ?? 'localhost',
      port: Number(this.configService.get<string>('MAILPIT_PORT') ?? 1025),
      secure: false,
    });
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailReturn> {
    try {
      await this.transporter.sendMail({
        from:
          this.configService.get<string>('MAILPIT_FROM') ??
          'Notifications <notifications@example.com',
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      return {
        sentSuccess: true,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        { to: params.to, subject: params.subject },
        'Failed to send email with Mailpit',
      );

      throw error;
    }
  }
}
