import { Heading, Text, Section, CodeInline } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";

type MagicLinkEmailProps = {
  url: string;
};

export function MagicLinkEmail({
  url = "https://example.com/api/auth/callback/resend?token=xxx",
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Votre lien de connexion"
      footerText="Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email."
    >
      <Heading style={heading}>Connexion</Heading>
      <Text style={paragraph}>
        Cliquez sur le bouton ci-dessous pour vous connecter à votre compte.
        Ce lien expire dans 24 heures.
      </Text>
      <Section style={buttonContainer}>
        <EmailButton href={url}>Se connecter</EmailButton>
      </Section>
      <Text style={link}>
        Ou copiez ce lien dans votre navigateur :{" "}
        {url}
      </Text>
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
