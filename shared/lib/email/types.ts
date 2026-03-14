export type EmailTag = {
  name: string;
  value: string;
};

export type EmailPayload = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  tags?: EmailTag[];
  replyTo?: string[];
};

export type SendEmailOptions = {
  idempotencyKey: string;
};
