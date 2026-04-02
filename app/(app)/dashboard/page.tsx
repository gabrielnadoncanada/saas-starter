import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import {
  checkLimit,
  hasCapability,
} from "@/features/billing/guards/plan-guards";
import { resolveOrganizationPlan } from "@/features/billing/plans/resolve-organization-plan";
import { getMonthlyUsage } from "@/features/billing/usage/usage-service";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { listTasks } from "@/features/tasks/server/task-mutations";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { getPlan } from "@/shared/config/billing.config";

function formatPlanPrice(unitAmount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

export default async function DashboardPage() {
  const [organization, tasks] = await Promise.all([
    getCurrentOrganization(),
    listTasks(),
  ]);

  const planId = resolveOrganizationPlan(organization);
  const plan = getPlan(planId);
  const memberCount = organization?.members?.length ?? 0;
  const taskCount = tasks.length;

  const [tasksUsage, aiUsage] = await Promise.all([
    organization ? getMonthlyUsage(organization.id, "tasksPerMonth") : 0,
    organization ? getMonthlyUsage(organization.id, "aiRequestsPerMonth") : 0,
  ]);
  const taskLimit = checkLimit(planId, "tasksPerMonth", tasksUsage);
  const aiLimit = checkLimit(planId, "aiRequestsPerMonth", aiUsage);
  const canUseAI = hasCapability(planId, "ai.assistant");
  const activeInterval =
    organization?.billingInterval && plan.prices[organization.billingInterval]
      ? organization.billingInterval
      : plan.prices.month
        ? "month"
        : plan.prices.year
          ? "year"
          : null;
  const activePrice = activeInterval ? plan.prices[activeInterval] : null;
  const priceLabel = activePrice
    ? formatPlanPrice(activePrice.unitAmount)
    : "Free";

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageDescription>
          Welcome back{organization?.name ? ` to ${organization.name}` : ""}.
        </PageDescription>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {plan.name}
              <Badge
                variant="outline"
                className="border-transparent text-green-500"
              >
                <ArrowUp />
                {planId}
              </Badge>
            </CardTitle>
            <CardDescription>
              <span>Current Plan</span>
            </CardDescription>
            <div>
              <div className="font-heading text-2xl font-semibold">
                {priceLabel}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tasks</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
              {taskCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageMeter
              label="Monthly usage"
              current={tasksUsage}
              limit={taskLimit.limit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Organization Members</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              {memberCount}
            </CardTitle>
          </CardHeader>
        </Card>

        {canUseAI && (
          <Card>
            <CardHeader>
              <CardDescription>AI Assistant</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                {aiUsage} requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageMeter
                label="Monthly usage"
                current={aiUsage}
                limit={aiLimit.limit}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {!hasCapability(planId, "team.analytics") && (
        <UpgradeCard
          feature="Organization Analytics"
          description="Upgrade your plan to access advanced analytics for your organization."
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link href={routes.app.tasks}>
          <Button variant="outline">
            View Tasks
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.app.assistant}>
          <Button variant="outline">
            AI Assistant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.settings.organization}>
          <Button variant="outline">
            Organization Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Page>
  );
}
