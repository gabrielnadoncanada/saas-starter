import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";

type ResetPasswordTemplateProps = {
  resetUrl: string;
};

export function ResetPasswordTemplate({
  resetUrl = "https://example.com/reset-password?token=example",
}: ResetPasswordTemplateProps) {
  return (
    <EmailLayout
      preview="Reset your password"
      footerText="If you did not request a password reset, you can ignore this email."
    >
      <Heading style={heading}>Reset your password</Heading>
      <Text style={paragraph}>
        Click the button below to choose a new password. This link expires in 1
        hour.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={resetUrl}>Reset password</EmailButton>
      </Section>
      <Text style={link}>Or copy this link into your browser: {resetUrl}</Text>
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
