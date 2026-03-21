"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type AssistantRouteError = {
  code?: string;
  error?: string;
};

type AssistantErrorStateProps = {
  error: Error;
  onDismiss: () => void;
};

function parseAssistantError(error: Error): AssistantRouteError {
  try {
    return JSON.parse(error.message) as AssistantRouteError;
  } catch {
    return { error: error.message };
  }
}

function getErrorTitle(code?: string) {
  if (code === "LIMIT_REACHED") {
    return "Monthly limit reached";
  }

  if (code === "UPGRADE_REQUIRED") {
    return "Upgrade required";
  }

  return "Something went wrong";
}

export function AssistantErrorState({
  error,
  onDismiss,
}: AssistantErrorStateProps) {
  const errorInfo = parseAssistantError(error);
  const isUpgradeError =
    errorInfo.code === "LIMIT_REACHED" || errorInfo.code === "UPGRADE_REQUIRED";

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-start gap-3 py-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">
            {getErrorTitle(errorInfo.code)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {errorInfo.error}
          </p>
        </div>
        {isUpgradeError ? (
          <Button size="sm" variant="outline" asChild>
            <a href="/pricing">Upgrade</a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Dismiss
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
