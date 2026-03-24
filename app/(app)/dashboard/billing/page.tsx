import { redirect } from "next/navigation";
import { CreditCard, BarChart3, Receipt } from "lucide-react";

import { getCurrentOrganization } from "@/features/teams/server/current-organization";
import { getCurrentOrganizationContext } from "@/features/teams/server/organization-context";
import { resolveTeamPlan, getPlan } from "@/features/billing/plans";
import { checkLimit } from "@/features/billing/guards";
import { getMonthlyUsage } from "@/features/billing/usage";
import { customerPortalAction } from "@/features/billing/actions/customer-portal.action";
import { PlanBadge } from "@/features/billing/components/plan-badge";
import { UsageMeter } from "@/features/billing/components/usage-meter";
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
} from "@/shared/components/layout/page";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { routes } from "@/shared/constants/routes";

function getSubscriptionLabel(organization: {
  billingInterval?: string | null;
  subscriptionStatus?: string | null;
}) {
  if (
    organization.subscriptionStatus === "active" &&
    organization.billingInterval === "month"
  ) {
    return "Billed monthly";
  }

  if (organization.subscriptionStatus === "active") {
    return "Active subscription";
  }

  if (organization.subscriptionStatus === "trialing") {
    return "Trial period";
  }

  if (organization.subscriptionStatus === "past_due") {
    return "Payment overdue. Update billing to restore paid access.";
  }

  if (
    organization.subscriptionStatus === "unpaid" ||
    organization.subscriptionStatus === "incomplete"
  ) {
    return "Payment issue. Update billing to continue.";
  }

  return "No active subscription";
}

export default async function BillingPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirect(routes.auth.login);
  }

  const { organization } = context;
  const planId = resolveTeamPlan(organization);
  const plan = getPlan(planId);

  const [tasksUsage, aiUsage] = await Promise.all([
    getMonthlyUsage(organization.id, "tasksPerMonth"),
    getMonthlyUsage(organization.id, "aiRequestsPerMonth"),
  ]);

  const taskLimit = checkLimit(planId, "tasksPerMonth", tasksUsage);
  const aiLimit = checkLimit(planId, "aiRequestsPerMonth", aiUsage);
  const memberLimit = checkLimit(
    planId,
    "teamMembers",
    organization.members?.length ?? 0,
  );

  const canManagePortal =
    context.canManageBilling &&
    organization.stripeCustomerId &&
    organization.subscriptionStatus;

  return (
    <Page fixed>
      <PageHeader>
        <PageTitle>Billing</PageTitle>
        <PageDescription>
          Manage your subscription, plan, and usage.
        </PageDescription>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Current Plan
          </CardTitle>
          <CardDescription>
            <span className="flex items-center gap-2">
              {plan.name} <PlanBadge plan={planId} />
              <span className="text-muted-foreground">
                &mdash; {getSubscriptionLabel(organization)}
              </span>
            </span>
          </CardDescription>
          <CardAction>
            {canManagePortal ? (
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline" size="sm">
                  Manage Subscription
                </Button>
              </form>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a href={routes.marketing.pricing}>View Plans</a>
              </Button>
            )}
          </CardAction>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Usage
          </CardTitle>
          <CardDescription>
            Your current usage for this billing period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageMeter
            label="Tasks this month"
            current={tasksUsage}
            limit={taskLimit.limit}
          />
          <UsageMeter
            label="AI requests this month"
            current={aiUsage}
            limit={aiLimit.limit}
          />
          <UsageMeter
            label="Team members"
            current={organization.members?.length ?? 0}
            limit={memberLimit.limit}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-4" />
            Plan Details
          </CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {plan.marketingFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Page>
  );
}
