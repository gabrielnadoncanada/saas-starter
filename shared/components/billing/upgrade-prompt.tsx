"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { routes } from "@/shared/constants/routes";
import type { BillingErrorCode } from "@/shared/types/form-action-state";

type UpgradePromptProps = {
  errorCode: BillingErrorCode | undefined;
  message?: string;
};

const COPY: Record<BillingErrorCode, { title: string; fallback: string }> = {
  UPGRADE_REQUIRED: {
    title: "Upgrade required",
    fallback: "This feature requires a higher plan.",
  },
  LIMIT_REACHED: {
    title: "Plan limit reached",
    fallback: "You've reached the usage limit for your current plan.",
  },
};

export function UpgradePrompt({ errorCode, message }: UpgradePromptProps) {
  if (!errorCode) {
    return null;
  }

  const copy = COPY[errorCode];

  return (
    <Alert>
      <Sparkles className="text-primary" />
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>
        <p>{message ?? copy.fallback}</p>
        <Button variant="link" asChild className="h-auto gap-1 p-0 text-sm">
          <Link href={routes.settings.billing}>
            View plans
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
