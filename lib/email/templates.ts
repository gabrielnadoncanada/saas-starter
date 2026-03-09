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

export function buildTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  teamName: string;
  invitationId: number;
}): EmailPayload {
  const invitationUrl = buildAbsoluteUrl(`/sign-in?inviteId=${input.invitationId}`);
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
