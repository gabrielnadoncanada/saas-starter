import { Heading, Text, Section } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

type TeamInvitationEmailProps = {
  inviterName: string;
  teamName: string;
  role: string;
  invitationUrl: string;
};

export function TeamInvitationEmail({
  inviterName = "John",
  teamName = "Acme",
  role = "member",
  invitationUrl = "https://example.com/sign-in?inviteId=1",
}: TeamInvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} vous invite à rejoindre ${teamName}`}
      footerText="Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email."
    >
      <Heading style={heading}>Invitation à rejoindre {teamName}</Heading>
      <Text style={paragraph}>
        <strong>{inviterName}</strong> vous invite à rejoindre{" "}
        <strong>{teamName}</strong> en tant que {role}.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={invitationUrl}>Accepter l&apos;invitation</EmailButton>
      </Section>
      <Text style={link}>
        Ou copiez ce lien dans votre navigateur :{" "}
        {invitationUrl}
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
