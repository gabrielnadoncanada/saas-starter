import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";

type MagicLinkEmailProps = {
  url: string;
};

export function MagicLinkEmail({
  url = "https://example.com/api/auth/callback/resend?token=xxx",
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Your sign-in link"
      footerText="If you did not request this link, you can safely ignore this email."
    >
      <Heading style={heading}>Sign in</Heading>
      <Text style={paragraph}>
        Click the button below to sign in to your account. This link expires in
        24 hours.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={url}>Sign in</EmailButton>
      </Section>
      <Text style={link}>Or copy this link into your browser: {url}</Text>
    </EmailLayout>
  );
}

export default MagicLinkEmail;

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
