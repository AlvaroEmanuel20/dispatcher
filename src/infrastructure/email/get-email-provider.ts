import { MailpitEmailProvider } from './providers/mailpit.provider';
import { ResendEmailProvider } from './providers/resend.provider';

export default function getEmailProvider() {
  if (process.env.NODE_ENV === 'production') {
    return ResendEmailProvider;
  }

  return MailpitEmailProvider;
}
