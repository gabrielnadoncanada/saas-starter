import { Resend } from "resend";
import { getEmailConfig } from "@/shared/lib/email/config";
import type { EmailPayload, SendEmailOptions } from "@/shared/lib/email/types";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const config = getEmailConfig();
    resendClient = new Resend(config.apiKey);
  }
  return resendClient;
}

export async function sendEmail(
  payload: EmailPayload,
  options: SendEmailOptions,
) {
  const config = getEmailConfig();
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    react: payload.react,
    text: payload.text,
    replyTo: payload.replyTo ?? config.replyTo,
    tags: payload.tags,
    headers: {
      "X-Idempotency-Key": options.idempotencyKey,
    },
  });

  if (error) {
    throw new Error(
      `Resend send failed: ${error.name} - ${error.message}`,
    );
  }

  return { id: data!.id };
}
