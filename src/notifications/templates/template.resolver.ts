import { NotificationTemplate } from '../../generated/prisma/enums';
import {
  EmailVerificationVariables,
  getEmailVerificationTemplate,
} from './email-verification.template';
import {
  getPasswordResetTemplate,
  PasswordResetVariables,
} from './password-reset.template';

export type TemplateReturn = {
  subject: string;
  html: string;
  text: string;
};

export interface NotificationTemplateVariables {
  [NotificationTemplate.EMAIL_VERIFICATION]: EmailVerificationVariables;
  [NotificationTemplate.PASSWORD_RESET]: PasswordResetVariables;
}

type TemplateResolverMap = {
  [T in keyof NotificationTemplateVariables]: (
    variables: NotificationTemplateVariables[T],
  ) => Promise<TemplateReturn>;
};

const templateRegistry: TemplateResolverMap = {
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
