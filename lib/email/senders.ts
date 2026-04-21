import { sendEmail } from "@/lib/email/client";
import {
  buildContactMessageEmail,
  buildTeamInvitationEmail,
} from "@/lib/email/templates";
import type { EmailPayload, SendEmailOptions } from "@/lib/email/types";

// Thin wrapper around sendEmail that emits structured logs for each send,
// so callers don't have to hand-roll try/catch + log scaffolding per template.
// Rethrows on failure — callers decide whether a send failure is fatal.
async function sendAndLog(
  event: string,
  payload: EmailPayload,
  context: Record<string, unknown>,
  options?: SendEmailOptions,
): Promise<void> {
  try {
    const result = await sendEmail(payload, options);
    console.info(`[email:${event}.sent]`, { ...context, resendEmailId: result.id });
  } catch (error) {
    console.error(`[email:${event}.failed]`, {
      ...context,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

export async function sendTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  organizationName: string;
  invitationToken: string;
}) {
  await sendAndLog(
    "team-invitation",
    buildTeamInvitationEmail(input),
    { email: input.email, invitationToken: input.invitationToken },
    { idempotencyKey: `team-invitation/${input.invitationToken}` },
  );
}

export async function sendContactMessageEmail(input: {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await sendAndLog(
    "contact-message",
    buildContactMessageEmail(input),
    { from: input.email, subject: input.subject },
  );
}
