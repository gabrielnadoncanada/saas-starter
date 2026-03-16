import ResendProvider from "next-auth/providers/resend";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const OAUTH_PROVIDER_LABELS = {
  google: "Google",
  github: "GitHub",
} as const;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDER_LABELS;

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

export function hasMagicLinkProvider() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  const enabledProviders: OAuthProviderId[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    enabledProviders.push("google");
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    enabledProviders.push("github");
  }

  return enabledProviders;
}

export function getAuthProviders() {
  const providers = [];

  if (hasMagicLinkProvider()) {
    providers.push(
      ResendProvider({
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM,
      })
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: allowEmailAccountLinking,
      })
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: allowEmailAccountLinking,
      })
    );
  }

  return providers;
}
