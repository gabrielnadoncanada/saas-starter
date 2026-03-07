import { getAppBaseUrl } from '@/lib/email/config';
import type { EmailPayload } from '@/lib/email/types';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildAbsoluteUrl(path: string) {
  const baseUrl = getAppBaseUrl();
  return new URL(path, baseUrl).toString();
}

export function buildPasswordResetEmail(input: {
  email: string;
  resetUrl: string;
}): EmailPayload {
  const resetUrl = input.resetUrl;

  return {
    to: [input.email],
    subject: 'Reset your password',
    text: [
      'We received a request to reset your password.',
      '',
      `Reset your password: ${resetUrl}`,
      '',
      'If you did not request this, you can safely ignore this email.'
    ].join('\n'),
    html: [
      '<p>We received a request to reset your password.</p>',
      `<p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>`,
      '<p>If you did not request this, you can safely ignore this email.</p>'
    ].join(''),
    tags: [{ name: 'email_type', value: 'password_reset' }]
  };
}

export function buildEmailVerificationEmail(input: {
  email: string;
  verificationUrl: string;
}): EmailPayload {
  const verificationUrl = input.verificationUrl;

  return {
    to: [input.email],
    subject: 'Verify your email address',
    text: [
      'Confirm your email address to finish setting up your account.',
      '',
      `Verify your email: ${verificationUrl}`,
      '',
      'If you did not create this account, you can ignore this email.'
    ].join('\n'),
    html: [
      '<p>Confirm your email address to finish setting up your account.</p>',
      `<p><a href="${escapeHtml(verificationUrl)}">Verify your email</a></p>`,
      '<p>If you did not create this account, you can ignore this email.</p>'
    ].join(''),
    tags: [{ name: 'email_type', value: 'email_verification' }]
  };
}

export function buildTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  teamName: string;
  invitationId: number;
}): EmailPayload {
  const invitationUrl = buildAbsoluteUrl(`/sign-up?inviteId=${input.invitationId}`);
  const safeInviterName = escapeHtml(input.inviterName);
  const safeTeamName = escapeHtml(input.teamName);

  return {
    to: [input.email],
    subject: `You're invited to join ${input.teamName}`,
    text: [
      `${input.inviterName} invited you to join ${input.teamName} as ${input.role}.`,
      '',
      `Accept the invitation: ${invitationUrl}`
    ].join('\n'),
    html: [
      `<p><strong>${safeInviterName}</strong> invited you to join <strong>${safeTeamName}</strong> as ${escapeHtml(input.role)}.</p>`,
      `<p><a href="${escapeHtml(invitationUrl)}">Accept the invitation</a></p>`
    ].join(''),
    tags: [{ name: 'email_type', value: 'team_invitation' }]
  };
}
