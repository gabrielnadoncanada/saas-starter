import { format } from "date-fns";
import { redirect } from "next/navigation";

import { Page } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import { isTrialingSubscription } from "@/features/billing/plans";
import { getBillingPageData } from "@/features/billing/server/get-billing-page-data";

export default async function SettingsBillingPage() {
  const data = await getBillingPageData();

  if (!data) {
    redirect(routes.auth.login);
  }

  const { context, entitlements, hasSubscription, plans } = data;
  const isTrialing = isTrialingSubscription(entitlements.subscriptionStatus);
  const trialEndsOn = entitlements.trialEnd
    ? format(entitlements.trialEnd, "MMM d, yyyy")
    : null;

  return (
    <Page>
      <div className="max-w-5xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Manage your team plan</CardTitle>
            <CardDescription>
              Choose a plan that fits your team's needs. You can upgrade or
              downgrade at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardDescription>Current plan</CardDescription>
                  {isTrialing ? (
                    <CardAction>
                      <Badge variant="secondary">Trial</Badge>
                    </CardAction>
                  ) : null}
                  <CardTitle>{entitlements.planName}</CardTitle>
                  {isTrialing ? (
                    <CardDescription>
                      {trialEndsOn
                        ? `Trial active until ${trialEndsOn}.`
                        : "Trial active."}
                    </CardDescription>
                  ) : null}
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Billing</CardDescription>
                  <CardTitle className="text-base font-normal text-muted-foreground">
                    {isTrialing
                      ? trialEndsOn
                        ? `This workspace is currently in trial until ${trialEndsOn}.`
                        : "This workspace is currently in trial."
                      : hasSubscription && entitlements.stripeCustomerId
                      ? "Manage subscription and invoices in the customer portal when available."
                      : "Pick a plan below to enable subscription billing."}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <BillingPlanSelector
              canManageBilling={context.isOwner}
              canManagePortal={
                context.isOwner &&
                hasSubscription &&
                Boolean(entitlements.stripeCustomerId)
              }
              canUpdateSubscription={
                context.isOwner &&
                hasSubscription &&
                Boolean(entitlements.stripeSubscriptionId)
              }
              currentBillingInterval={entitlements.billingInterval}
              currentPlanId={entitlements.planId}
              hasCurrentSubscription={hasSubscription}
              plans={plans}
            />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
