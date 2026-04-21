"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { routes } from "@/constants/routes";
import { authClient } from "@/lib/auth/auth-client";
import { buildCheckEmailHref } from "@/lib/auth/callback-url";
import type { OAuthProviderId } from "@/lib/auth/oauth-config";

type UseAuthSocialActionsParams = {
  callbackUrl?: string | null;
  magicLinkErrorMessage: string;
  oauthErrorMessage: string;
};

type MagicLinkActions = {
  isPending: boolean;
  error: string | null;
  submit: (email: string) => void;
};

type OAuthActions = {
  isPending: boolean;
  pendingProvider: OAuthProviderId | null;
  error: string | null;
  submit: (provider: OAuthProviderId) => void;
};

export type UseAuthSocialActionsReturn = {
  magicLink: MagicLinkActions;
  oauth: OAuthActions;
};

export function useAuthSocialActions({
  callbackUrl,
  magicLinkErrorMessage,
  oauthErrorMessage,
}: UseAuthSocialActionsParams): UseAuthSocialActionsReturn {
  const nextCallbackUrl = callbackUrl ?? routes.auth.postSignIn;

  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] =
    useState<OAuthProviderId | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);

  const submitMagicLink = useCallback(
    async function submitMagicLink(email: string): Promise<void> {
      setMagicLinkError(null);
      setIsSendingMagicLink(true);

      try {
        const { error: authError } = await authClient.signIn.magicLink({
          email,
          callbackURL: nextCallbackUrl,
        });

        if (authError) {
          throw new Error(authError.message || magicLinkErrorMessage);
        }

        window.location.assign(buildCheckEmailHref(email, nextCallbackUrl));
      } catch {
        setMagicLinkError(magicLinkErrorMessage);
        toast.error(magicLinkErrorMessage);
      } finally {
        setIsSendingMagicLink(false);
      }
    },
    [nextCallbackUrl, magicLinkErrorMessage],
  );

  const submitOAuth = useCallback(
    async function submitOAuth(provider: OAuthProviderId): Promise<void> {
      setOAuthError(null);
      setPendingProvider(provider);

      try {
        const { error: authError } = await authClient.signIn.social({
          provider,
          callbackURL: nextCallbackUrl,
        });

        if (authError) {
          throw new Error(authError.message || oauthErrorMessage);
        }
      } catch {
        setOAuthError(oauthErrorMessage);
        toast.error(oauthErrorMessage);
      } finally {
        setPendingProvider(null);
      }
    },
    [nextCallbackUrl, oauthErrorMessage],
  );

  return {
    magicLink: {
      isPending: isSendingMagicLink,
      error: magicLinkError,
      submit: (email: string) => void submitMagicLink(email),
    },
    oauth: {
      isPending: pendingProvider !== null,
      pendingProvider,
      error: oauthError,
      submit: (provider: OAuthProviderId) => void submitOAuth(provider),
    },
  };
}
