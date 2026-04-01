import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";

type VerifyEmailTemplateProps = {
  verificationUrl: string;
};

export function VerifyEmailTemplate({
  verificationUrl = "https://example.com/verify-email?token=example",
}: VerifyEmailTemplateProps) {
  return (
    <EmailLayout
      preview="Verify your email address"
      footerText="If you did not create this account, you can ignore this email."
    >
      <Heading style={heading}>Verify your email address</Heading>
      <Text style={paragraph}>
        Click the button below to activate your account. This link expires in 24
        hours.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={verificationUrl}>Verify email</EmailButton>
      </Section>
      <Text style={link}>
        Or copy this link into your browser: {verificationUrl}
      </Text>
    </EmailLayout>
  );
}

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
  textAlign: "center",
  margin: "32px 0",
};

const link: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#9ca3af",
  wordBreak: "break-all",
};
