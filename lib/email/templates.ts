import { createElement } from "react";

import { getAppBaseUrl } from "@/lib/email/config";
import { TeamInvitationEmail } from "@/lib/email/templates/team-invitation";
import type { EmailPayload } from "@/lib/email/types";

function buildAbsoluteUrl(path: string) {
  const baseUrl = getAppBaseUrl();
  return new URL(path, baseUrl).toString();
}

function sanitizeForEmailSubject(value: string) {
  return value
    .replace(/[\r\n]/g, " ")
    .trim()
    .slice(0, 100);
}

export function buildTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  organizationName: string;
  invitationToken: string;
}): EmailPayload {
  const invitationUrl = buildAbsoluteUrl(
    `/accept-invitation/${input.invitationToken}`,
  );

  const safeTeamName = sanitizeForEmailSubject(input.organizationName);

  return {
    to: [input.email],
    subject: `You're invited to join ${safeTeamName}`,
    react: createElement(TeamInvitationEmail, {
      inviterName: input.inviterName,
      organizationName: input.organizationName,
      role: input.role,
      invitationUrl,
    }),
    text: [
      `${input.inviterName} invited you to join ${input.organizationName} as ${input.role}.`,
      "",
      `Accept the invitation: ${invitationUrl}`,
    ].join("\n"),
    tags: [{ name: "email_type", value: "team_invitation" }],
  };
}
