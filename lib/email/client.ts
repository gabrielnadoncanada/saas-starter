import { getEmailConfig } from '@/lib/email/config';
import type { EmailPayload, SendEmailOptions } from '@/lib/email/types';

type ResendSendEmailResponse = {
  id: string;
};

export async function sendEmail(
  payload: EmailPayload,
  options: SendEmailOptions
) {
  const config = getEmailConfig();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': options.idempotencyKey
    },
    body: JSON.stringify({
      from: config.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo ?? config.replyTo,
      tags: payload.tags
    })
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Resend send failed with status ${response.status}: ${body.slice(0, 500)}`
    );
  }

  return (await response.json()) as ResendSendEmailResponse;
}
