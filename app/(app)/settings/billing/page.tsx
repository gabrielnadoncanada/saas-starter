import { getTranslations } from "next-intl/server";

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
import { defaultLocale } from "@/shared/i18n/locales";
import { redirectToLocale } from "@/shared/i18n/href";

export default async function SettingsBillingPage() {
  const [context, entitlements] = await Promise.all([
    getCurrentOrganizationContext(),
    getCurrentOrganizationEntitlements(),
  ]);
  const t = await getTranslations("settings.billing");

  if (!context || !entitlements) {
    redirectToLocale(null, routes.auth.login);
  }

  const creditActivity = await listCreditActivity(entitlements.organizationId, 8);
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
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>{t("currentPlan")}</CardDescription>
                  <CardTitle>{entitlements.planName}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>{t("creditsBalance")}</CardDescription>
                  <CardTitle>{entitlements.creditBalance}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>{t("includedCredits")}</CardDescription>
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
              currentSeatQuantity={entitlements.seats ?? context.organization.members.length}
              hasCurrentSubscription={hasCurrentSubscription}
              plans={plans}
            />
          </CardContent>
        </Card>

        {creditPacks.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("creditPacksTitle")}</CardTitle>
              <CardDescription>{t("creditPacksDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {creditPacks.map((creditPack) => (
                <form key={creditPack.id} action={buyCreditPackAction} className="rounded-xl border p-4">
                  <input type="hidden" name="itemKey" value={creditPack.id} />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{creditPack.name}</p>
                      <p className="text-sm text-muted-foreground">{creditPack.description}</p>
                    </div>
                    <p className="text-sm">{t("creditsGranted", { count: creditPack.creditsGranted })}</p>
                    <Button type="submit">{t("buyCredits")}</Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {oneTimeProducts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("oneTimeProductsTitle")}</CardTitle>
              <CardDescription>{t("oneTimeProductsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {oneTimeProducts.map((product) => (
                <form key={product.id} action={startOneTimeCheckoutAction} className="rounded-xl border p-4">
                  <input type="hidden" name="itemKey" value={product.id} />
                  <input type="hidden" name="itemType" value="one_time_product" />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <Button type="submit">{t("buyOneTime")}</Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("creditActivityTitle")}</CardTitle>
            <CardDescription>{t("creditActivityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {creditActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noCreditActivity")}</p>
            ) : (
              creditActivity.map((entry) => (
                <div key={`${entry.createdAt.toISOString()}-${entry.delta}`} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-medium">{entry.reason}</p>
                    <p className="text-muted-foreground">
                      {entry.createdAt.toLocaleString(defaultLocale)}
                    </p>
                  </div>
                  <p className={entry.delta >= 0 ? "text-green-600" : "text-foreground"}>
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
