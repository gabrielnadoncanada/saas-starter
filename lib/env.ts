import "server-only";

import { z } from "zod";

const requiredEnvSchema = z.object({
  POSTGRES_URL: z.string().min(1, "Database connection string is required"),
  AUTH_SECRET: z.string().min(1, "Auth secret is required (generate with: openssl rand -base64 32)"),
  BASE_URL: z.string().url("BASE_URL must be a valid URL (e.g. http://localhost:3000)"),
});

const optionalFeatureGroups = [
  {
    name: "Stripe billing",
    vars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    hint: "Paid plans and checkout won't work without Stripe keys.",
  },
  {
    name: "Stripe plan prices",
    vars: [
      "STRIPE_PRICE_PRO_MONTHLY",
      "STRIPE_PRICE_PRO_YEARLY",
      "STRIPE_PRICE_TEAM_MONTHLY",
      "STRIPE_PRICE_TEAM_YEARLY",
    ],
    hint: "Plans without a price ID won't appear on the pricing page.",
  },
  {
    name: "Email (Resend)",
    vars: ["RESEND_API_KEY", "EMAIL_FROM"],
    hint: "Email sending (invitations, password reset, verification) is disabled.",
  },
  {
    name: "Rate limiting (Upstash Redis)",
    vars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    hint: "Rate limiting is disabled; AI and sensitive endpoints are not throttled.",
  },
  {
    name: "Error tracking (Sentry)",
    vars: ["NEXT_PUBLIC_SENTRY_DSN"],
    hint: "Errors will not be reported. Set NEXT_PUBLIC_SENTRY_DSN to enable.",
  },
] as const;

function validateEnv() {
  const result = requiredEnvSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n\nMissing required environment variables:\n${missing}\n\nCopy .env.example to .env and fill in the values.\n`,
    );
  }

  for (const group of optionalFeatureGroups) {
    const missing = group.vars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      console.warn(
        `[env] ${group.name}: ${missing.join(", ")} not set. ${group.hint}`,
      );
    }
  }

  return result.data;
}

export const env = validateEnv();
