import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

import { hasCapability } from "@/features/billing/entitlements";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
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
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{planName}</Badge>
        </CardAction>
        <CardTitle>
          <Crown className="size-5 text-primary" />
          Plan & AI Entitlements
        </CardTitle>
        <CardDescription>
          {`What's included in your ${planName} plan.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium">Your entitlements</p>
          <ItemGroup className="gap-2">
            {highlights.map((highlight) => (
              <Item key={highlight} variant="outline" size="sm">
                <ItemMedia variant="icon">
                  <Check className="size-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{highlight}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
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
                <p className="font-medium">
                  {formatNumber(aiCreditsUsage)} used
                </p>
                <p className="text-muted-foreground">
                  {formatNumber(aiCreditsLimit)} total
                </p>
              </div>
            </div>

            <Progress value={usagePercent} />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={routes.settings.billing}>
            Manage billing & limits
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
