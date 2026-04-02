"use client";

import { useTranslations } from "next-intl";
import { useActionState, useMemo, useState } from "react";

import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/features/api-keys/actions/api-key.actions";
import type { FormActionState } from "@/shared/types/form-action-state";
import { useToastMessage } from "@/shared/hooks/useToastMessage";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type ApiKeyListItem = {
  id: string;
  name: string;
  prefix: string;
  capabilities: string[];
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

type ApiKeysPanelProps = {
  apiKeys: ApiKeyListItem[];
  availableCapabilities: string[];
};

type CreateApiKeyState = FormActionState<{
  name: string;
  capabilities: string[];
}> & {
  secret?: string;
};

export function ApiKeysPanel({
  apiKeys,
  availableCapabilities,
}: ApiKeysPanelProps) {
  const t = useTranslations("apiKeysPanel");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(
    availableCapabilities.slice(0, 1),
  );
  const [createState, createFormAction, isCreating] = useActionState<
    CreateApiKeyState,
    FormData
  >(createApiKeyAction, {});
  const [revokeState, revokeFormAction, isRevoking] = useActionState(
    revokeApiKeyAction,
    {},
  );

  useToastMessage(createState.success, { kind: "success", trigger: createState });
  useToastMessage(createState.error, {
    kind: "error",
    skip: Boolean(createState.fieldErrors),
    trigger: createState,
  });
  useToastMessage(revokeState.success, { kind: "success", trigger: revokeState });
  useToastMessage(revokeState.error, { kind: "error", trigger: revokeState });

  const selectedValue = useMemo(
    () => selectedCapabilities.join(","),
    [selectedCapabilities],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
          <CardDescription>{t("createDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {createState.secret ? (
            <Alert>
              <AlertTitle>{t("copySecret")}</AlertTitle>
              <AlertDescription className="break-all font-mono text-xs">
                {createState.secret}
              </AlertDescription>
            </Alert>
          ) : null}

          <form action={createFormAction} className="space-y-4">
            <FieldGroup className="gap-4">
              <Field data-invalid={Boolean(createState.fieldErrors?.name?.length)}>
                <FieldLabel htmlFor="api-key-name">{t("name")}</FieldLabel>
                <Input
                  id="api-key-name"
                  name="name"
                  placeholder={t("namePlaceholder")}
                  required
                />
                <FieldError>{createState.fieldErrors?.name?.[0]}</FieldError>
              </Field>

              <Field data-invalid={Boolean(createState.fieldErrors?.capabilities?.length)}>
                <FieldLabel>{t("capabilities")}</FieldLabel>
                <input type="hidden" name="capabilities" value={selectedValue} readOnly />
                <div className="space-y-3 rounded-lg border p-3">
                  {availableCapabilities.map((capability) => {
                    const checked = selectedCapabilities.includes(capability);

                    return (
                      <label
                        key={capability}
                        className="flex items-center gap-3 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextValue) => {
                            setSelectedCapabilities((current) =>
                              nextValue
                                ? [...current, capability]
                                : current.filter((item) => item !== capability),
                            );
                          }}
                        />
                        <span>{capability}</span>
                      </label>
                    );
                  })}
                </div>
                <FieldError>{createState.fieldErrors?.capabilities?.[0]}</FieldError>
              </Field>
            </FieldGroup>

            <Button type="submit" disabled={isCreating}>
              {isCreating ? t("creating") : t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("listTitle")}</CardTitle>
          <CardDescription>{t("listDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="rounded-lg border p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{apiKey.name}</p>
                    <p className="text-muted-foreground">{apiKey.prefix}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {apiKey.capabilities.join(", ")}
                    </p>
                  </div>

                  {apiKey.revokedAt ? (
                    <span className="text-xs text-muted-foreground">{t("revoked")}</span>
                  ) : (
                    <form action={revokeFormAction}>
                      <input type="hidden" name="apiKeyId" value={apiKey.id} />
                      <Button type="submit" variant="outline" size="sm" disabled={isRevoking}>
                        {t("revoke")}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
