import { createElement } from "react";
import { getAppBaseUrl } from "@/shared/lib/email/config";
import type { EmailPayload } from "@/shared/lib/email/types";
import { TeamInvitationEmail } from "@/shared/lib/email/templates/team-invitation";

function buildAbsoluteUrl(path: string) {
  const baseUrl = getAppBaseUrl();
  return new URL(path, baseUrl).toString();
}

function sanitizeForEmailSubject(value: string) {
  return value.replace(/[\r\n]/g, " ").trim().slice(0, 100);
}

export function buildTeamInvitationEmail(input: {
  email: string;
  role: string;
  inviterName: string;
  teamName: string;
  invitationToken: string;
}): EmailPayload {
  const invitationUrl = buildAbsoluteUrl(
    `/accept-invitation/${input.invitationToken}`,
  );

  const safeTeamName = sanitizeForEmailSubject(input.teamName);

  return {
    to: [input.email],
    subject: `Vous êtes invité à rejoindre ${safeTeamName}`,
    react: createElement(TeamInvitationEmail, {
      inviterName: input.inviterName,
      teamName: input.teamName,
      role: input.role,
      invitationUrl,
    }),
    text: [
      `${input.inviterName} vous invite à rejoindre ${input.teamName} en tant que ${input.role}.`,
      "",
      `Accepter l'invitation : ${invitationUrl}`,
    ].join("\n"),
    tags: [{ name: "email_type", value: "team_invitation" }],
  };
}
