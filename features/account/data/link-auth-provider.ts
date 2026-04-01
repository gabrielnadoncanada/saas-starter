"use client";

import { routes } from "@/shared/constants/routes";
import { authClient } from "@/shared/lib/auth/auth-client";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

function buildSettingsUrl(provider: OAuthProviderId, status?: string) {
  const searchParams = new URLSearchParams({ provider });

  if (status) {
    searchParams.set("success", status);
  }

  return `${routes.settings.profile}?${searchParams.toString()}`;
}

export async function linkAuthProvider(provider: OAuthProviderId) {
  const result = await authClient.$fetch<{
    redirect: boolean;
    status: boolean;
    url: string;
  }>("/link-social", {
    method: "POST",
    body: {
      provider,
      callbackURL: buildSettingsUrl(provider, "linked"),
      errorCallbackURL: buildSettingsUrl(provider),
      disableRedirect: true,
    },
  });

  if (result.error) {
    throw new Error(result.error.message || "Unable to link this provider.");
  }

  if (!result.data?.url) {
    throw new Error("Unable to link this provider.");
  }

  window.location.assign(result.data.url);
}
