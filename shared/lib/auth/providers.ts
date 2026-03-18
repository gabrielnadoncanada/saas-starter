import { createElement } from "react";
import { z } from "zod";
import ResendProvider from "next-auth/providers/resend";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/shared/lib/email/templates/magic-link";
import { createRateLimiter } from "@/shared/lib/rate-limit/in-memory-rate-limiter";
import { authenticatePasswordCredentials } from "@/features/auth/server/credentials-user";

// Rate limit: max 3 magic links per email per 15 minutes
const magicLinkRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
});

/**
 * Controls whether OAuth providers allow automatic account linking
 * by email address. When true, a user who signs in with Google using
 * "user@example.com" will be linked to an existing account that was
 * created via GitHub (or magic link) with the same email.
 *
 * Security note: Disabled by default. Only enable if all configured
 * OAuth providers guarantee email verification (Google and GitHub do).
 * The signIn callback also checks `email_verified` from the provider profile.
 *
 * Set ALLOW_EMAIL_ACCOUNT_LINKING=true in .env to enable.
 */
const allowEmailAccountLinking =
  process.env.ALLOW_EMAIL_ACCOUNT_LINKING === "true";

const oauthProviders = [
  {
    id: "google",
    label: "Google",
    authButtonLabel: "Continue with Google",
    isEnabled: () =>
      Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    createProvider: () =>
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: allowEmailAccountLinking,
      }),
  },
  {
    id: "github",
    label: "GitHub",
    authButtonLabel: "Continue with GitHub",
    isEnabled: () =>
      Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    createProvider: () =>
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: allowEmailAccountLinking,
      }),
  },
] as const;

export const OAUTH_PROVIDER_IDS = oauthProviders.map(
  (provider) => provider.id,
) as [OAuthProviderId, ...OAuthProviderId[]];

export type OAuthProviderId = (typeof oauthProviders)[number]["id"];

export const OAUTH_PROVIDER_LABELS = Object.fromEntries(
  oauthProviders.map((provider) => [provider.id, provider.label]),
) as Record<OAuthProviderId, string>;

export const oauthProviderIdSchema = z.enum(OAUTH_PROVIDER_IDS);

export function getOAuthProviderConfig(providerId: OAuthProviderId) {
  return oauthProviders.find((provider) => provider.id === providerId)!;
}

export function hasMagicLinkProvider() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  return oauthProviders
    .filter((provider) => provider.isEnabled())
    .map((provider) => provider.id);
}

export function getAuthProviders() {
  return [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === "string" ? credentials.email : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";

        const result = await authenticatePasswordCredentials({ email, password });

        return result.status === "success" ? result.user : null;
      },
    }),
    ...(hasMagicLinkProvider()
      ? [
      ResendProvider({
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM,
        maxAge: 10 * 60, // Magic link valid for 10 minutes
        async sendVerificationRequest({ identifier: email, url }) {
          // Rate limit by email address
          const rateLimitResult = magicLinkRateLimiter.check(
            `magic-link:${email.toLowerCase()}`,
          );
          if (!rateLimitResult.allowed) {
            throw new Error("Too many sign-in attempts. Please try again later.");
          }

          const resend = new Resend(process.env.RESEND_API_KEY);

          const { error } = await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: [email],
            subject: "Votre lien de connexion",
            react: createElement(MagicLinkEmail, { url }),
          });

          if (error) {
            throw new Error(
              `Failed to send magic link: ${error.name} - ${error.message}`,
            );
          }
        },
      })
      ]
      : []),
    ...oauthProviders
      .filter((provider) => provider.isEnabled())
      .map((provider) => provider.createProvider()),
  ];
}
