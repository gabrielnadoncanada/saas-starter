"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

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
  const errorInfo = parseAssistantError(error);
  const isUpgradeError =
    errorInfo.code === "LIMIT_REACHED" || errorInfo.code === "UPGRADE_REQUIRED";

  const title =
    errorInfo.code === "LIMIT_REACHED"
      ? "Monthly limit reached"
      : errorInfo.code === "UPGRADE_REQUIRED"
        ? "Upgrade required"
        : "Something went wrong";

  const tone = isUpgradeError
    ? "border-brand/40 bg-brand/5"
    : "border-destructive/40 bg-destructive/5";

  const iconTone = isUpgradeError ? "text-brand" : "text-destructive";

  const labelTone = isUpgradeError
    ? "text-brand"
    : "text-destructive";

  return (
    <div className={`border ${tone}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <AlertTriangle
          className={`mt-0.5 size-4 shrink-0 ${iconTone}`}
          strokeWidth={1.75}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <span className={`label-mono block ${labelTone}`}>{title}</span>
          <p className="text-sm text-foreground">{errorInfo.error}</p>
        </div>
        {isUpgradeError ? (
          <Button size="sm" variant="outline" asChild>
            <Link href={routes.settings.billing}>Upgrade</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <RotateCcw className="mr-1 size-3" strokeWidth={1.75} />
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

export { AssistantChatErrorState };
