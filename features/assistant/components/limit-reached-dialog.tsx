"use client";

import type { UIMessage } from "ai";
import { ArrowUpRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  BillingInterval,
  PlanId,
} from "@/config/billing.config";
import { startSubscriptionCheckoutAction } from "@/features/billing/actions/checkout.actions";
import type { AssistantToolFailure } from "@/features/assistant/types";
import { isToolPart } from "@/features/assistant/utils/message-parts";

type LimitReachedDialogProps = {
  currentPlanName: string;
  messages: UIMessage[];
  upgradeBillingInterval: BillingInterval;
  upgradePlanId: PlanId | null;
  upgradePlanName: string | null;
};

type TriggerState = {
  code: "LIMIT_REACHED" | "UPGRADE_REQUIRED";
  message: string;
  partKey: string;
};

function getToolFailure(part: UIMessage["parts"][number]) {
  if (!isToolPart(part) || !("output" in part)) {
    return null;
  }

  const output = part.output;
  if (
    typeof output !== "object" ||
    output === null ||
    !("success" in output) ||
    output.success !== false
  ) {
    return null;
  }

  const failure = output as AssistantToolFailure;
  if (
    failure.error.code !== "LIMIT_REACHED" &&
    failure.error.code !== "UPGRADE_REQUIRED"
  ) {
    return null;
  }

  return failure;
}

export function LimitReachedDialog({
  currentPlanName,
  messages,
  upgradeBillingInterval,
  upgradePlanId,
  upgradePlanName,
}: LimitReachedDialogProps) {
  const [trigger, setTrigger] = useState<TriggerState | null>(null);
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const message of messages) {
      message.parts.forEach((part, index) => {
        const failure = getToolFailure(part);
        if (!failure) {
          return;
        }

        const partKey = `${message.id}-${index}`;
        if (seenKeysRef.current.has(partKey)) {
          return;
        }
        seenKeysRef.current.add(partKey);

        setTrigger({
          code: failure.error.code as TriggerState["code"],
          message: failure.error.message,
          partKey,
        });
      });
    }
  }, [messages]);

  const open = trigger !== null;
  const canUpgrade = Boolean(upgradePlanId && upgradePlanName);

  const title =
    trigger?.code === "UPGRADE_REQUIRED"
      ? "Upgrade required"
      : "Plan limit reached";

  const description = canUpgrade
    ? `You're on ${currentPlanName}. Upgrade to ${upgradePlanName} to keep going.`
    : `You're on ${currentPlanName} and have reached your plan limit.`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTrigger(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {trigger ? (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
            {trigger.message}
          </p>
        ) : null}

        <DialogFooter>
          {canUpgrade && upgradePlanId ? (
            <form action={startSubscriptionCheckoutAction}>
              <input type="hidden" name="planId" value={upgradePlanId} />
              <input
                type="hidden"
                name="billingInterval"
                value={upgradeBillingInterval}
              />
              <Button type="submit">
                Upgrade to {upgradePlanName}
                <ArrowUpRightIcon />
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              onClick={() => setTrigger(null)}
              type="button"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
