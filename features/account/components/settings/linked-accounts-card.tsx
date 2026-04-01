"use client";

import { format, parseISO } from "date-fns";
import { useActionState, useState } from "react";

import { OAuthProviderIcon } from "@/features/auth/components/oauth/oauth-provider-icon";
import { signInWithOAuth } from "@/features/auth/data/auth-requests";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/shared/components/ui/item";
import { unlinkAuthProviderAction } from "@/features/account/actions/unlink-auth-provider.action";
import type {
  LinkedAccountsActionState,
  LinkedProviderOverview,
  SecuritySettingsFeedback,
} from "@/features/account/types/account.types";
import { routes } from "@/shared/constants/routes";
import { getOAuthProviderConfig } from "@/shared/lib/auth/oauth-config";
import { getFieldState } from "@/shared/lib/get-field-state";
import { useToastMessage } from "@/shared/hooks/useToastMessage";

type LinkedAccountsCardProps = {
  providers: LinkedProviderOverview[];
  feedback?: SecuritySettingsFeedback;
};

export function LinkedAccountsCard({
  providers,
  feedback,
}: LinkedAccountsCardProps) {
  const [linkingProvider, setLinkingProvider] = useState<
    LinkedProviderOverview["provider"] | null
  >(null);
  const [state, formAction, isPending] = useActionState<
    LinkedAccountsActionState,
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
      await signInWithOAuth(
        provider,
        `${routes.settings.profile}?provider=${provider}&success=linked`,
      );
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
                  {provider.linkedAt
                    ? `Linked on ${format(provider.linkedAt, "PP")}`
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
