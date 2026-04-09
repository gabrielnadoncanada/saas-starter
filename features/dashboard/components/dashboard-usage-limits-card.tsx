import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { routes } from "@/shared/constants/routes";

type DashboardUsageLimitsCardProps = {
  aiCreditsLimit: number;
  aiCreditsUsage: number;
  taskLimit: number;
  tasksUsage: number;
};

function formatUsageNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

function formatUsage(current: number, limit: number) {
  return `${formatUsageNumber(current)} / ${formatUsageNumber(limit)}`;
}

function getProgressValue(current: number, limit: number) {
  if (limit <= 0) {
    return 0;
  }

  return Math.min(100, (current / limit) * 100);
}

export function DashboardUsageLimitsCard({
  aiCreditsLimit,
  aiCreditsUsage,
  taskLimit,
  tasksUsage,
}: DashboardUsageLimitsCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardDescription>Usage & Limits</CardDescription>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5 text-orange-500" />
          Usage
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Tasks</p>
            <p className="text-sm font-medium text-muted-foreground">
              {formatUsage(tasksUsage, taskLimit)}
            </p>
          </div>
          <Progress value={getProgressValue(tasksUsage, taskLimit)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">AI Credits</p>
            <p className="text-sm font-medium text-muted-foreground">
              {formatUsage(aiCreditsUsage, aiCreditsLimit)}
            </p>
          </div>
          <Progress value={getProgressValue(aiCreditsUsage, aiCreditsLimit)} />
        </div>

        <Link
          href={routes.settings.billing}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          View usage details
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
