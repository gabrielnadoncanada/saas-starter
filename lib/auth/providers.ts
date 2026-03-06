import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const OAUTH_PROVIDER_LABELS = {
  google: 'Google',
  github: 'GitHub'
} as const;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDER_LABELS;

export function getEnabledOAuthProviderIds(): OAuthProviderId[] {
  const enabledProviders: OAuthProviderId[] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    enabledProviders.push('google');
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    enabledProviders.push('github');
  }

  return enabledProviders;
}

export function getAuthProviders() {
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      })
    );
  }

  return providers;
}
