import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  ArrowUp,
} from "lucide-react";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { listCurrentOrganizationTasks } from "@/features/tasks/server/tasks";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { resolveOrganizationPlan, getPlan } from "@/features/billing/plans";
import { hasCapability, checkLimit } from "@/features/billing/guards";
import { getMonthlyUsage } from "@/features/billing/usage";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import { Badge } from "@/shared/components/ui/badge";
import { UpgradeCard } from "@/features/billing/components/upgrade-card";

export default async function DashboardPage() {
  const [organization, tasks] = await Promise.all([
    getCurrentOrganization(),
    listCurrentOrganizationTasks(),
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
              <div className="font-heading text-2xl font-semibold">$3.4</div>
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



