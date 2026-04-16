import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { EmailLayout } from "./components/email-layout";

type ContactMessageEmailProps = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactMessageEmail({
  name = "Visitor",
  email = "visitor@example.com",
  subject = "Hello",
  message = "I'd like to know more.",
}: ContactMessageEmailProps) {
  return (
    <EmailLayout
      preview={`New contact message from ${name}`}
      footerText="Sent from the marketing site contact form."
    >
      <Heading style={heading}>{subject}</Heading>
      <Text style={paragraph}>
        From <strong>{name}</strong> &lt;{email}&gt;
      </Text>
      <Section style={messageBox}>
        {message.split("\n").map((line, index) => (
          <Text key={index} style={paragraph}>
            {line || "\u00A0"}
          </Text>
        ))}
      </Section>
    </EmailLayout>
  );
}

export default ContactMessageEmail;

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0f172a",
  margin: "24px 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#334155",
};

const messageBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};
