import { sendEmail } from "@/shared/lib/email/client";
import { buildTeamInvitationEmail } from "@/shared/lib/email/templates";

function logEmailResult(event: string, details: Record<string, unknown>) {
  console.info(`[email:${event}]`, details);
}

function logEmailError(event: string, details: Record<string, unknown>) {
  console.error(`[email:${event}]`, details);
}

export async function sendTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  teamName: string;
  invitationToken: string;
}) {
  const payload = buildTeamInvitationEmail(input);

  try {
    const result = await sendEmail(payload, {
      idempotencyKey: `team-invitation/${input.invitationToken}`,
    });

    logEmailResult("team-invitation.sent", {
      email: input.email,
      invitationToken: input.invitationToken,
      resendEmailId: result.id,
    });
  } catch (error) {
    logEmailError("team-invitation.failed", {
      email: input.email,
      invitationToken: input.invitationToken,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
