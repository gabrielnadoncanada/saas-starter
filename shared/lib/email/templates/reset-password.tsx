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
      preview="Réinitialisez votre mot de passe"
      footerText="Si vous n'avez pas demandé cette réinitialisation, ignorez cet email."
    >
      <Heading style={heading}>Réinitialisation du mot de passe</Heading>
      <Text style={paragraph}>
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={resetUrl}>Réinitialiser mon mot de passe</EmailButton>
      </Section>
      <Text style={link}>Ou copiez ce lien dans votre navigateur : {resetUrl}</Text>
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
