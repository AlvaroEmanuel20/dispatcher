import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from '../email.provider';
import { SendEmailParams, SendEmailReturn } from '../email-provider.types';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  async sendEmail(params: SendEmailParams): Promise<SendEmailReturn> {
    try {
      const { error, data } = await this.resend.emails.send({
        from: this.configService.getOrThrow<string>('RESEND_FROM'),
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (error) {
        throw error;
      }

      return {
        sentSuccess: true,
        sentAt: new Date(),
        providerEmailId: data.id,
      };
    } catch (error) {
      this.logger.error(
        { to: params.to, subject: params.subject },
        'Failed to send email with Resend',
      );

      throw error;
    }
  }
}
