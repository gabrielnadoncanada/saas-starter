import { z } from "zod";

const oauthProviders = [
  {
    id: "google",
    label: "Google",
    authButtonLabel: "Continue with Google",
    isEnabled: () =>
      Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
  {
    id: "github",
    label: "GitHub",
    authButtonLabel: "Continue with GitHub",
    isEnabled: () =>
      Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
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

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  return oauthProviders
    .filter((provider) => provider.isEnabled())
    .map((provider) => provider.id);
}

export function hasMagicLinkProvider() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
