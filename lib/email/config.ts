const DEFAULT_BASE_URL = "http://localhost:3000";

export type EmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string[];
  baseUrl: string;
};

function readRequiredEnv(name: "RESEND_API_KEY" | "EMAIL_FROM") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function getEmailConfig(): EmailConfig {
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();

  return {
    apiKey: readRequiredEnv("RESEND_API_KEY"),
    from: readRequiredEnv("EMAIL_FROM"),
    replyTo: replyTo ? [replyTo] : undefined,
    baseUrl: getAppBaseUrl(),
  };
}

export function getAppBaseUrl() {
  return (
    process.env.BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    DEFAULT_BASE_URL
  );
}
