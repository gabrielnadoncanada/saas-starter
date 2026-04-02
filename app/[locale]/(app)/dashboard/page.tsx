import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { UpgradeCard } from "@/features/billing/components/upgrade-card";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import { hasCapability } from "@/features/billing/guards/plan-guards";
import { DashboardActivityFeed } from "@/features/dashboard/components/dashboard-activity-feed";
import { DashboardOnboardingChecklist } from "@/features/dashboard/components/dashboard-onboarding-checklist";
import { DashboardRecentTasks } from "@/features/dashboard/components/dashboard-recent-tasks";
import { DashboardUsageChart } from "@/features/dashboard/components/dashboard-usage-chart";
import { getDashboardOverview } from "@/features/dashboard/server/get-dashboard-overview";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

function formatPlanPrice(unitAmount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(unitAmount / 100);
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const {
    organization,
    planId,
    plan,
    memberCount,
    taskCount,
    tasksUsage,
    aiUsage,
    taskLimit,
    aiLimit,
    canUseAI,
    recentActivity,
    recentTasks,
    usageChart,
    checklist,
    apiKeyCount,
  } = await getDashboardOverview(locale);

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
    ? formatPlanPrice(activePrice.unitAmount, locale)
    : t("planPriceFree");
  const organizationNameSuffix = organization?.name ? ` ${organization.name}` : "";
  const workspaceName = organization?.name ?? t("workspaceFallback");

  return (
    <Page>
      <PageHeader>
        <PageTitle>{t("title")}</PageTitle>
        <PageDescription>
          {t("description", { organizationName: organizationNameSuffix })}
        </PageDescription>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              {plan.name}
              <span className="ml-2 inline-flex items-center rounded-full border border-transparent px-2 py-1 text-xs text-green-500">
                <ArrowUp className="mr-1 size-3" />
                {planId}
              </span>
            </CardTitle>
            <CardDescription>{t("currentPlan")}</CardDescription>
            <div className="font-heading text-2xl font-semibold">
              {priceLabel}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("tasksThisMonth")}</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
              {taskCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageMeter
              label={t("monthlyQuota")}
              current={tasksUsage}
              limit={taskLimit.limit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>{t("members")}</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-5 w-5 text-orange-500" />
              {memberCount}
            </CardTitle>
          </CardHeader>
        </Card>

        {canUseAI && (
          <Card>
            <CardHeader>
              <CardDescription>{t("aiAssistant")}</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="h-5 w-5 text-orange-500" />
                {t("aiRequests", { count: aiUsage })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UsageMeter
                label={t("monthlyQuota")}
                current={aiUsage}
                limit={aiLimit.limit}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("taskActivityTitle")}</CardTitle>
            <CardDescription>{t("taskActivityDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardUsageChart data={usageChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("checklistTitle")}</CardTitle>
            <CardDescription>{t("checklistDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOnboardingChecklist items={checklist} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentTasksTitle")}</CardTitle>
            <CardDescription>
              {t("recentTasksDescription", { organizationName: workspaceName })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRecentTasks tasks={recentTasks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("activityTitle")}</CardTitle>
            <CardDescription>{t("activityDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardActivityFeed activity={recentActivity} />
          </CardContent>
        </Card>
      </div>

      {!hasCapability(planId, "team.analytics") && (
        <UpgradeCard
          feature={t("upgradeAnalyticsFeature")}
          description={t("upgradeAnalyticsDescription")}
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link href={routes.app.tasks}>
          <Button variant="outline">
            {t("viewTasks")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.app.assistant}>
          <Button variant="outline">
            {t("openAssistant")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.settings.organization}>
          <Button variant="outline">
            {t("organizationSettings")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        {hasCapability(planId, "api.access") && (
          <Link href={routes.settings.apiKeys}>
            <Button variant="outline">
              {t("apiKeys", { count: apiKeyCount })}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </Page>
  );
}
