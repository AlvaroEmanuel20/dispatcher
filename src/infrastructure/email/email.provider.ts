import { SendEmailParams, SendEmailReturn } from './email-provider.types';

export abstract class EmailProvider {
  abstract sendEmail(params: SendEmailParams): Promise<SendEmailReturn>;
}
