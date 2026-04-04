"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { updateOrganizationAiSettingsAction } from "@/features/assistant/actions/organization-ai-settings.actions";
import type { OrganizationAiSettingsView } from "@/features/assistant/types";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useRouter } from "@/shared/i18n/navigation";
import type { AiModelId, AiModelOption } from "@/shared/lib/ai/models";

type ActionState = {
  error?: string;
  success?: string;
  refreshKey?: number;
};

type OrganizationAiSettingsPanelProps = {
  canManage: boolean;
  modelOptions: AiModelOption[];
  settings: OrganizationAiSettingsView;
};

function getNextDefaultModelId(
  allowedModelIds: AiModelId[],
  currentDefaultModelId: AiModelId,
) {
  if (allowedModelIds.includes(currentDefaultModelId)) {
    return currentDefaultModelId;
  }

  return allowedModelIds[0] ?? currentDefaultModelId;
}

export function OrganizationAiSettingsPanel({
  canManage,
  modelOptions,
  settings,
}: OrganizationAiSettingsPanelProps) {
  const t = useTranslations("ai");
  const tc = useTranslations("common");
  const router = useRouter();
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    updateOrganizationAiSettingsAction,
    {},
  );
  const [allowedModelIds, setAllowedModelIds] = useState(
    settings.allowedModelIds,
  );
  const [defaultModelId, setDefaultModelId] = useState(settings.defaultModelId);

  useEffect(() => {
    setAllowedModelIds(settings.allowedModelIds);
    setDefaultModelId(settings.defaultModelId);
  }, [settings.allowedModelIds, settings.defaultModelId]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
    }

    if (state.refreshKey) {
      router.refresh();
    }
  }, [router, state.error, state.refreshKey, state.success]);

  const defaultOptions = useMemo(
    () => modelOptions.filter((model) => allowedModelIds.includes(model.id)),
    [allowedModelIds, modelOptions],
  );

  function toggleModel(modelId: AiModelId) {
    setAllowedModelIds((current) => {
      const nextAllowedModelIds = current.includes(modelId)
        ? current.filter((id) => id !== modelId)
        : [...current, modelId];

      setDefaultModelId((currentDefaultModelId) =>
        getNextDefaultModelId(nextAllowedModelIds, currentDefaultModelId),
      );

      return nextAllowedModelIds;
    });
  }

  const isSubmitDisabled =
    isPending || !canManage || allowedModelIds.length === 0 || !defaultModelId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Models</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <input
            name="allowedModelIds"
            type="hidden"
            value={allowedModelIds.join(",")}
          />
          <input name="defaultModelId" type="hidden" value={defaultModelId} />

          <div className="space-y-3">
            <Label>{t("settings.allowedModels")}</Label>
            <div className="space-y-3">
              {modelOptions.map((model) => {
                const isChecked = allowedModelIds.includes(model.id);

                return (
                  <label
                    className="flex items-start gap-3 rounded-lg border p-3"
                    key={model.id}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={!canManage || isPending}
                      onCheckedChange={() => toggleModel(model.id)}
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium">
                        {model.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {model.providerLabel}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="defaultModelId">{t("settings.defaultModel")}</Label>
            <Select
              disabled={!canManage || isPending || defaultOptions.length === 0}
              onValueChange={(value) => setDefaultModelId(value as AiModelId)}
              value={defaultModelId}
            >
              <SelectTrigger className="w-full" id="defaultModelId">
                <SelectValue
                  placeholder={t("settings.defaultModelPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {defaultOptions.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.defaultModelHelp")}
            </p>
          </div>

          <Button disabled={isSubmitDisabled} type="submit">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tc("saving")}
              </>
            ) : (
              tc("save")
            )}
          </Button>
        </form>
      </CardContent>
      {!canManage ? (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {t("settings.ownerOnly")}
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}
