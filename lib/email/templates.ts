import { createElement } from "react";

import { getAppBaseUrl } from "@/lib/email/config";
import { ContactMessageEmail } from "@/lib/email/templates/contact-message";
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

export function buildContactMessageEmail(input: {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailPayload {
  const safeSubject = sanitizeForEmailSubject(input.subject);

  return {
    to: [input.to],
    subject: `[Contact] ${safeSubject}`,
    replyTo: [input.email],
    react: createElement(ContactMessageEmail, {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    }),
    text: [
      `From: ${input.name} <${input.email}>`,
      `Subject: ${input.subject}`,
      "",
      input.message,
    ].join("\n"),
    tags: [{ name: "email_type", value: "contact_message" }],
  };
}
