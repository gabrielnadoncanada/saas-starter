"use client";

import { format, parseISO } from "date-fns";
import { useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { routes } from "@/constants/routes";
import { unlinkAuthProviderAction } from "@/features/account/actions/unlink-auth-provider.actions";
import type { LinkedProviderOverview } from "@/features/account/server/linked-accounts";
import { OAuthProviderIcon } from "@/features/auth/components/oauth/oauth-provider-icon";
import { useToastMessage } from "@/hooks/use-toast-message";
import { authClient } from "@/lib/auth/auth-client";
import {
  getOAuthProviderConfig,
  type OAuthProviderId,
} from "@/lib/auth/oauth-config";
import { getFieldState } from "@/lib/get-field-state";
import type { FormActionState } from "@/types/form-action-state";

function buildSettingsUrl(provider: OAuthProviderId, status?: string) {
  const searchParams = new URLSearchParams({ provider });

  if (status) {
    searchParams.set("success", status);
  }

  return `${routes.settings.profile}?${searchParams.toString()}`;
}

async function linkAuthProvider(provider: OAuthProviderId) {
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

type LinkedAccountsCardProps = {
  providers: LinkedProviderOverview[];
  feedback?: {
    error?: string;
    success?: string;
  };
};

export function LinkedAccountsCard({
  providers,
  feedback,
}: LinkedAccountsCardProps) {
  const [linkingProvider, setLinkingProvider] = useState<
    LinkedProviderOverview["provider"] | null
  >(null);
  const [state, formAction, isPending] = useActionState<
    FormActionState<{ provider: LinkedProviderOverview["provider"] }>,
    FormData
  >(unlinkAuthProviderAction, {});
  const selectedProvider = state.values?.provider;
  const providerField = getFieldState(state, "provider");

  useToastMessage(state.error, {
    kind: "error",
    skip: Boolean(state.fieldErrors),
    trigger: state,
  });
  useToastMessage(state.success, { kind: "success", trigger: state });
  useToastMessage(feedback?.error, {
    kind: "error",
  });
  useToastMessage(feedback?.success, {
    kind: "success",
  });

  async function handleLinkAccount(
    provider: LinkedProviderOverview["provider"],
  ) {
    setLinkingProvider(provider);

    try {
      await linkAuthProvider(provider);
    } finally {
      setLinkingProvider(null);
    }
  }

  return (
    <>
      <ItemGroup className="gap-4">
        {providers.map((provider) => {
          const isUnlinkingProvider =
            selectedProvider === provider.provider && isPending;
          const isLinkingProvider = linkingProvider === provider.provider;
          const providerConfig = getOAuthProviderConfig(provider.provider);
          const linkedAt = provider.linkedAt
            ? parseISO(provider.linkedAt)
            : null;

          return (
            <Item key={provider.provider} variant="outline">
              <ItemContent>
                <ItemTitle className="flex items-center gap-2">
                  <OAuthProviderIcon
                    provider={provider.provider}
                    className="h-4 w-4 shrink-0"
                  />
                  {providerConfig.label}
                  {provider.isLinked ? (
                    <Badge variant="secondary">Linked</Badge>
                  ) : null}
                </ItemTitle>
                <ItemDescription>
                  {linkedAt
                    ? `Linked on ${format(linkedAt, "PP")}`
                    : "Not linked yet"}
                </ItemDescription>
              </ItemContent>

              <ItemActions>
                {provider.isLinked ? (
                  provider.canUnlink ? (
                    <form action={formAction}>
                      <input
                        type="hidden"
                        name="provider"
                        value={provider.provider}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isUnlinkingProvider}
                      >
                        {isUnlinkingProvider ? "Unlinking..." : "Unlink"}
                      </Button>
                    </form>
                  ) : (
                    <Badge>Required</Badge>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLinkingProvider}
                    onClick={() => void handleLinkAccount(provider.provider)}
                  >
                    {isLinkingProvider ? "Redirecting..." : "Link"}
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>

      <Field data-invalid={providerField.invalid} className="gap-1">
        <FieldLabel className="sr-only" htmlFor="linked-account-provider">
          Provider
        </FieldLabel>
        <input
          id="linked-account-provider"
          type="hidden"
          name="provider"
          value={selectedProvider ?? ""}
          readOnly
        />
        <FieldError>{providerField.error}</FieldError>
      </Field>
    </>
  );
}
