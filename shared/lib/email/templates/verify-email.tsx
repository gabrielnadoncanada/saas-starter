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
      preview="Confirmez votre adresse email"
      footerText="Si vous n'avez pas créé ce compte, ignorez simplement cet email."
    >
      <Heading style={heading}>Confirmez votre adresse email</Heading>
      <Text style={paragraph}>
        Cliquez sur le bouton ci-dessous pour activer votre compte. Ce lien expire dans 24 heures.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={verificationUrl}>Confirmer mon email</EmailButton>
      </Section>
      <Text style={link}>Ou copiez ce lien dans votre navigateur : {verificationUrl}</Text>
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
