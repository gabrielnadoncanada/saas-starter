import { Check, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

import { hasCapability } from "@/features/billing/plan-guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import type { OrganizationEntitlements } from "@/shared/config/billing.config";
import { routes } from "@/shared/constants/routes";

type DashboardPlanAiEntitlementsCardProps = {
  aiCreditsLimit: number;
  aiCreditsUsage: number;
  entitlements: OrganizationEntitlements | null;
  planName: string;
  taskLimit: number;
};

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function getProgressValue(current: number, limit: number) {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, (current / limit) * 100);
}

function formatPercent(value: number) {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  })}%`;
}

function getPlanHighlights(
  entitlements: OrganizationEntitlements | null,
  taskLimit: number,
  aiCreditsLimit: number,
) {
  if (!entitlements) {
    return [];
  }

  const highlights = [
    `Up to ${formatNumber(taskLimit)} tasks per month`,
    `Up to ${formatNumber(entitlements.limits.teamMembers)} team members`,
    `${formatNumber(aiCreditsLimit)} AI credits per month`,
  ];

  if (hasCapability(entitlements, "team.analytics")) {
    highlights.push("Team analytics included");
  } else if (hasCapability(entitlements, "ai.assistant")) {
    highlights.push("AI assistant access");
  } else if (hasCapability(entitlements, "task.export")) {
    highlights.push("Task export access");
  } else {
    highlights.push("Billing portal access");
  }

  return highlights;
}

export function DashboardPlanAiEntitlementsCard({
  aiCreditsLimit,
  aiCreditsUsage,
  entitlements,
  planName,
  taskLimit,
}: DashboardPlanAiEntitlementsCardProps) {
  const highlights = getPlanHighlights(entitlements, taskLimit, aiCreditsLimit);
  const usagePercent = getProgressValue(aiCreditsUsage, aiCreditsLimit);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-orange-500" />
          <CardTitle>Plan & AI Entitlements</CardTitle>
        </div>
        <CardDescription>
          {`What's included in your ${planName} plan.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <p className="text-sm font-medium">Your entitlements</p>
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 text-green-600" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-orange-500" />
            <p className="text-sm font-medium">AI usage this month</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold">
                  {formatPercent(usagePercent)}
                </p>
                <p className="text-sm text-muted-foreground">used</p>
              </div>

              <div className="text-right text-sm">
                <p className="font-medium">{formatNumber(aiCreditsUsage)} used</p>
                <p className="text-muted-foreground">
                  {formatNumber(aiCreditsLimit)} total
                </p>
              </div>
            </div>

            <Progress value={usagePercent} />
          </div>
        </div>

        <Link
          href={routes.settings.billing}
          className="text-sm font-medium text-primary lg:col-span-2"
        >
          Manage billing & limits
        </Link>
      </CardContent>
    </Card>
  );
}
