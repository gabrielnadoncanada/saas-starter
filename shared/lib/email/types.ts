import type { ReactElement } from "react";

export type EmailTag = {
  name: string;
  value: string;
};

export type EmailPayload = {
  to: string[];
  subject: string;
  react: ReactElement;
  text: string;
  tags?: EmailTag[];
  replyTo?: string[];
};

export type SendEmailOptions = {
  idempotencyKey?: string;
};
