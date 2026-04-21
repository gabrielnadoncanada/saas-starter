import { Resend } from "resend";

import { getEmailConfig } from "@/lib/email/config";
import type { EmailPayload, SendEmailOptions } from "@/lib/email/types";

let resendClient: Resend | null = null;

function getResendClient(apiKey: string) {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail(
  payload: EmailPayload,
  options: SendEmailOptions = {},
) {
  const config = getEmailConfig();
  const resend = getResendClient(config.apiKey);

  const headers = options.idempotencyKey
    ? { "X-Idempotency-Key": options.idempotencyKey }
    : undefined;

  const { data, error } = await resend.emails.send({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    react: payload.react,
    text: payload.text,
    replyTo: payload.replyTo ?? config.replyTo,
    tags: payload.tags,
    headers,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.name} - ${error.message}`);
  }

  if (!data) {
    throw new Error("Resend send failed: no response data returned.");
  }

  return { id: data.id };
}
