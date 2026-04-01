import { Heading, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./components/email-layout";

export function PasswordChangedTemplate() {
  return (
    <EmailLayout
      preview="Your password was changed"
      footerText="If this was not you, reset your password immediately."
    >
      <Heading style={heading}>Password updated</Heading>
      <Text style={paragraph}>
        Your account password was updated successfully.
      </Text>
      <Text style={paragraph}>
        If you did not expect this change, use the password reset flow right
        away.
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
