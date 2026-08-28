import { NotificationTemplateVariables } from './templates/template.resolver';

export interface EmailNotificationJobData<
  T extends keyof NotificationTemplateVariables =
    keyof NotificationTemplateVariables,
> {
  recipient: string;
  variables: NotificationTemplateVariables[T];
  template: T;
}
