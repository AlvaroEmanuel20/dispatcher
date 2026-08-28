export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailReturn = {
  sentSuccess: boolean;
  sentAt?: Date;
  providerEmailId?: string;
};
