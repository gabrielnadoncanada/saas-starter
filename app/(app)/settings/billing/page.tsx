import { redirect } from "next/navigation";

import {
  buyCreditPackAction,
  startOneTimeCheckoutAction,
} from "@/features/billing/actions/checkout.actions";
import {
  getPlanDisplayPrice,
  getPricingPlans,
  listCreditPacks,
  listOneTimeProducts,
  listRecurringAddons,
} from "@/features/billing/catalog/resolver";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import type { BillingPlanOption } from "@/features/billing/components/billing-plan-selector-fields";
import { hasCurrentStripeSubscription } from "@/features/billing/plans/subscription-status";
import { listCreditActivity } from "@/features/billing/server/credits";
import { getCurrentOrganizationEntitlements } from "@/features/billing/server/organization-entitlements";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import { Page } from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { PlanId } from "@/shared/config/billing.config";
import { routes } from "@/shared/constants/routes";

export default async function SettingsBillingPage() {
  const [context, entitlements] = await Promise.all([
    getCurrentOrganizationContext(),
    getCurrentOrganizationEntitlements(),
  ]);

  if (!context || !entitlements) {
    redirect(routes.auth.login);
  }

  const creditActivity = await listCreditActivity(
    entitlements.organizationId,
    8,
  );
  const hasCurrentSubscription = hasCurrentStripeSubscription(
    entitlements.subscriptionStatus,
  );
  const plans: BillingPlanOption[] = getPricingPlans().map((plan) => ({
    id: plan.id as PlanId,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    pricingModel: plan.pricingModel,
    monthly: getPlanDisplayPrice(plan.id, "month"),
    yearly: getPlanDisplayPrice(plan.id, "year"),
  }));
  const addons = listRecurringAddons().map((addon) => ({
    id: addon.id,
    name: addon.name,
    description: addon.description,
    monthly: addon.prices.month ?? null,
    yearly: addon.prices.year ?? null,
  }));
  const creditPacks = listCreditPacks();
  const oneTimeProducts = listOneTimeProducts();

  return (
    <Page fixed className="ml-0">
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
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Current plan</CardDescription>
                  <CardTitle>{entitlements.planName}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Credit balance</CardDescription>
                  <CardTitle>{entitlements.creditBalance}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Included monthly credits</CardDescription>
                  <CardTitle>{entitlements.includedMonthlyCredits}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <BillingPlanSelector
              addons={addons}
              canManageBilling={context.canManageBilling}
              canManagePortal={
                Boolean(context.canManageBilling) &&
                hasCurrentSubscription &&
                Boolean(entitlements.stripeCustomerId)
              }
              canUpdateSubscription={
                Boolean(context.canManageBilling) &&
                hasCurrentSubscription &&
                Boolean(entitlements.stripeSubscriptionId)
              }
              currentAddonIds={entitlements.activeAddonIds}
              currentBillingInterval={entitlements.billingInterval}
              currentPlanId={entitlements.planId}
              currentSeatQuantity={
                entitlements.seats ?? context.organization.members.length
              }
              hasCurrentSubscription={hasCurrentSubscription}
              plans={plans}
            />
          </CardContent>
        </Card>

        {creditPacks.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Credit packs</CardTitle>
              <CardDescription>
                Buy one-time top-ups when your team needs more AI usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {creditPacks.map((creditPack) => (
                <form
                  key={creditPack.id}
                  action={buyCreditPackAction}
                  className="rounded-xl border p-4"
                >
                  <input type="hidden" name="itemKey" value={creditPack.id} />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{creditPack.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {creditPack.description}
                      </p>
                    </div>
                    <p className="text-sm">
                      {creditPack.creditsGranted} credits
                    </p>
                    <Button type="submit">Buy credits</Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}

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

        <Card>
          <CardHeader>
            <CardTitle>Credit activity</CardTitle>
            <CardDescription>
              Recent grants, charges, and refunds for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {creditActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No credit activity yet.
              </p>
            ) : (
              creditActivity.map((entry) => (
                <div
                  key={`${entry.createdAt.toISOString()}-${entry.delta}`}
                  className="flex items-center justify-between rounded-xl border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{entry.reason}</p>
                    <p className="text-muted-foreground">
                      {entry.createdAt.toLocaleString("en")}
                    </p>
                  </div>
                  <p
                    className={
                      entry.delta >= 0 ? "text-green-600" : "text-foreground"
                    }
                  >
                    {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
