import { sendEmail } from '@/lib/email/client';
import {
  buildEmailVerificationEmail,
  buildPasswordResetEmail,
  buildTeamInvitationEmail
} from '@/lib/email/templates';

function logEmailResult(event: string, details: Record<string, unknown>) {
  console.info(`[email:${event}]`, details);
}

function logEmailError(event: string, details: Record<string, unknown>) {
  console.error(`[email:${event}]`, details);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const payload = buildPasswordResetEmail({ email, resetUrl });

  try {
    const result = await sendEmail(payload, {
      idempotencyKey: `password-reset/${email}`
    });

    logEmailResult('password-reset.sent', {
      email,
      resendEmailId: result.id
    });
  } catch (error) {
    logEmailError('password-reset.failed', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function sendEmailVerificationEmail(
  email: string,
  verificationUrl: string
) {
  const payload = buildEmailVerificationEmail({ email, verificationUrl });

  try {
    const result = await sendEmail(payload, {
      idempotencyKey: `email-verification/${email}`
    });

    logEmailResult('email-verification.sent', {
      email,
      resendEmailId: result.id
    });
  } catch (error) {
    logEmailError('email-verification.failed', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function sendTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  teamName: string;
  invitationId: number;
}) {
  const payload = buildTeamInvitationEmail(input);

  try {
    const result = await sendEmail(payload, {
      idempotencyKey: `team-invitation/${input.invitationId}`
    });

    logEmailResult('team-invitation.sent', {
      email: input.email,
      invitationId: input.invitationId,
      resendEmailId: result.id
    });
  } catch (error) {
    logEmailError('team-invitation.failed', {
      email: input.email,
      invitationId: input.invitationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
