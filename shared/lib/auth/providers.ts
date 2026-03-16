import { createElement } from "react";
import { z } from "zod";
import ResendProvider from "next-auth/providers/resend";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/shared/lib/email/templates/magic-link";

/**
 * Controls whether OAuth providers allow automatic account linking
 * by email address. When true, a user who signs in with Google using
 * "user@example.com" will be linked to an existing account that was
 * created via GitHub (or magic link) with the same email.
 *
 * Security note: This is safe only because both Google and GitHub
 * return verified email addresses. If you add a provider that does
 * NOT guarantee email verification, set this to false or add an
 * email-verified check in the signIn callback.
 *
 * Set ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING=false in .env to disable.
 */
const allowEmailAccountLinking =
  process.env.ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING !== "false";

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
  const providers = [];

  if (hasMagicLinkProvider()) {
    providers.push(
      ResendProvider({
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM,
        async sendVerificationRequest({ identifier: email, url }) {
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
    );
  }

  providers.push(
    ...oauthProviders
      .filter((provider) => provider.isEnabled())
      .map((provider) => provider.createProvider()),
  );

  return providers;
}
