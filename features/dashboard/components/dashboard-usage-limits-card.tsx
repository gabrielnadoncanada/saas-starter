import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

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
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
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
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Usage & Limits</CardDescription>
        <CardAction>
          <p className="text-sm text-muted-foreground">Current cycle</p>
        </CardAction>
        <CardTitle>
          <BarChart3 className="size-5 text-primary" />
          Usage
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">Tasks</p>
            <p className="text-sm font-medium text-muted-foreground">
              {formatUsage(tasksUsage, taskLimit)}
            </p>
          </div>
          <Progress value={getProgressValue(tasksUsage, taskLimit)} />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium">AI Credits</p>
            <p className="text-sm font-medium text-muted-foreground">
              {formatUsage(aiCreditsUsage, aiCreditsLimit)}
            </p>
          </div>
          <Progress value={getProgressValue(aiCreditsUsage, aiCreditsLimit)} />
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={routes.settings.billing}>
            View usage details
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
