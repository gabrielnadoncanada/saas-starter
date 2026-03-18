import { Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";

export function PasswordChangedTemplate() {
  return (
    <EmailLayout
      preview="Votre mot de passe a été modifié"
      footerText="Si ce changement ne vient pas de vous, réinitialisez votre mot de passe immédiatement."
    >
      <Heading style={heading}>Mot de passe mis à jour</Heading>
      <Text style={paragraph}>
        Le mot de passe de votre compte vient d'être modifié avec succès.
      </Text>
      <Text style={paragraph}>
        Si ce changement n'était pas prévu, utilisez le flow de réinitialisation du mot de passe dès maintenant.
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
