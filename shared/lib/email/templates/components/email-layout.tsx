import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Font,
} from "@react-email/components";
import * as React from "react";

type EmailLayoutProps = {
  preview: string;
  children: React.ReactNode;
  footerText?: string;
};

export function EmailLayout({ preview, children, footerText }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
            format: "woff2",
          }}
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={content}>{children}</Section>
          {footerText && (
            <>
              <Hr style={hr} />
              <Text style={footer}>{footerText}</Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "580px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const content: React.CSSProperties = {
  padding: "0 48px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
};

const footer: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  padding: "0 48px",
};
