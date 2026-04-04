"use client";

import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { unlinkAuthProviderAction } from "@/features/account/actions/unlink-auth-provider.actions";
import { linkAuthProvider } from "@/features/account/data/link-auth-provider";
import type {
  LinkedProviderOverview,
} from "@/features/account/server/linked-accounts";
import { OAuthProviderIcon } from "@/features/auth/components/oauth/oauth-provider-icon";
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
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { getOAuthProviderConfig } from "@/shared/lib/auth/oauth-config";
import { getFieldState } from "@/shared/lib/get-field-state";
import type { FormActionState } from "@/shared/types/form-action-state";

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
  const t = useTranslations("settings");
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
                        {isUnlinkingProvider
                          ? t("linkedAccounts.unlinking")
                          : t("linkedAccounts.unlink")}
                      </Button>
                    </form>
                  ) : (
                    <Badge>{t("linkedAccounts.required")}</Badge>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLinkingProvider}
                    onClick={() => void handleLinkAccount(provider.provider)}
                  >
                    {isLinkingProvider
                      ? t("linkedAccounts.redirecting")
                      : t("linkedAccounts.link")}
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>

      <Field data-invalid={providerField.invalid} className="gap-1">
        <FieldLabel className="sr-only" htmlFor="linked-account-provider">
          {t("linkedAccounts.providerFieldLabel")}
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
