import { NotificationTemplate } from '../../generated/prisma/enums';
import {
  EmailVerificationVariables,
  getEmailVerificationTemplate,
} from './email-verification.template';
import {
  getPasswordResetTemplate,
  PasswordResetVariables,
} from './password-reset.template';
import { getWelcomeTemplate, WelcomeVariables } from './welcome.template';

export type TemplateReturn = {
  subject: string;
  html: string;
  text: string;
};

export interface NotificationTemplateVariables {
  [NotificationTemplate.WELCOME]: WelcomeVariables;
  [NotificationTemplate.EMAIL_VERIFICATION]: EmailVerificationVariables;
  [NotificationTemplate.PASSWORD_RESET]: PasswordResetVariables;
}

type TemplateResolverMap = {
  [T in keyof NotificationTemplateVariables]: (
    variables: NotificationTemplateVariables[T],
  ) => Promise<TemplateReturn>;
};

const templateRegistry: TemplateResolverMap = {
  [NotificationTemplate.WELCOME]: getWelcomeTemplate,
  [NotificationTemplate.EMAIL_VERIFICATION]: getEmailVerificationTemplate,
  [NotificationTemplate.PASSWORD_RESET]: getPasswordResetTemplate,
};

export function resolveNotificationTemplate<
  T extends keyof NotificationTemplateVariables,
>(
  template: T,
  variables: NotificationTemplateVariables[T],
): Promise<TemplateReturn> | null {
  const templateFunction = templateRegistry[template];

  if (!templateFunction) return null;

  return templateFunction(variables);
}
