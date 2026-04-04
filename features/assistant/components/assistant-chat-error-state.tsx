"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

type AssistantRouteError = {
  code?: string;
  error?: string;
};

function parseAssistantError(error: Error): AssistantRouteError {
  try {
    return JSON.parse(error.message) as AssistantRouteError;
  } catch {
    return { error: error.message };
  }
}

function AssistantChatErrorState({
  error,
  onDismiss,
}: {
  error: Error;
  onDismiss: () => void;
}) {
  const t = useTranslations("assistant");
  const errorInfo = parseAssistantError(error);
  const isUpgradeError =
    errorInfo.code === "LIMIT_REACHED" || errorInfo.code === "UPGRADE_REQUIRED";

  const title =
    errorInfo.code === "LIMIT_REACHED"
      ? t("error.limitReached")
      : errorInfo.code === "UPGRADE_REQUIRED"
        ? t("error.upgradeRequired")
        : t("error.somethingWentWrong");

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-start gap-3 py-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {errorInfo.error}
          </p>
        </div>
        {isUpgradeError ? (
          <Button size="sm" variant="outline" asChild>
            <Link href={routes.marketing.pricing}>{t("error.upgrade")}</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <RotateCcw className="mr-1 h-3 w-3" />
            {t("error.dismiss")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { AssistantChatErrorState };
