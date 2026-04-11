import { format } from "date-fns";
import { redirect } from "next/navigation";

import { startOneTimeCheckoutAction } from "@/features/billing/actions/checkout.actions";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import { isTrialingSubscription } from "@/features/billing/plans";
import { getBillingPageData } from "@/features/billing/server/get-billing-page-data";
import { Page } from "@/shared/components/layout/page-layout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";

export default async function SettingsBillingPage() {
  const data = await getBillingPageData();

  if (!data) {
    redirect(routes.auth.login);
  }

  const { context, entitlements, hasSubscription, plans, oneTimeProducts } =
    data;
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
              currentSeatQuantity={
                entitlements.seats ?? context.organization.members.length
              }
              hasCurrentSubscription={hasSubscription}
              plans={plans}
            />
          </CardContent>
        </Card>

        {oneTimeProducts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>One-time products</CardTitle>
              <CardDescription>
                Sell one-time workspace upgrades without moving the team to a
                recurring plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {oneTimeProducts.map((product) => (
                <form
                  key={product.id}
                  action={startOneTimeCheckoutAction}
                  className="rounded-xl border p-4"
                >
                  <input type="hidden" name="itemKey" value={product.id} />
                  <input
                    type="hidden"
                    name="itemType"
                    value="one_time_product"
                  />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                    <Button type="submit">Buy now</Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Page>
  );
}
