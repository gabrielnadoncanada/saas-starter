import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";

type TeamInvitationEmailProps = {
  inviterName: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
};

export function TeamInvitationEmail({
  inviterName = "John",
  organizationName = "Acme",
  role = "member",
  invitationUrl = "https://example.com/accept-invitation/1",
}: TeamInvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${organizationName}`}
      footerText="If you were not expecting this invitation, you can ignore this email."
    >
      <Heading style={heading}>Join {organizationName}</Heading>
      <Text style={paragraph}>
        <strong>{inviterName}</strong> invited you to join{" "}
        <strong>{organizationName}</strong> as {role}.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={invitationUrl}>Accept invitation</EmailButton>
      </Section>
      <Text style={link}>
        Or copy this link into your browser: {invitationUrl}
      </Text>
    </EmailLayout>
  );
}

export default TeamInvitationEmail;

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#0f172a",
  margin: "32px 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#334155",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const link: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#9ca3af",
  wordBreak: "break-all" as const,
};
