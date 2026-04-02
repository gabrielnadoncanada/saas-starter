import { getTranslations } from "next-intl/server";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import { hasCurrentStripeSubscription } from "@/features/billing/plans/subscription-status";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import { Page } from "@/shared/components/layout/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { getPricingPlans, isPlanId } from "@/shared/config/billing.config";
import { redirectToLocale } from "@/shared/i18n/href";

export default async function SettingsBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, context] = await Promise.all([
    params,
    getCurrentOrganizationContext(),
  ]);
  const t = await getTranslations("settings.billing");

  if (!context) {
    redirectToLocale(locale, routes.auth.login);
  }

  const { organization } = context;
  const currentPlanId =
    organization.planId && isPlanId(organization.planId)
      ? organization.planId
      : "free";
  const hasCurrentSubscription = hasCurrentStripeSubscription(
    organization.subscriptionStatus,
  );
  const plans = getPricingPlans()
    .map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      features: plan.features,
      pricingModel: plan.pricingModel,
      monthly: plan.prices.month ?? null,
      yearly: plan.prices.year ?? null,
    }))
    .filter((plan) => plan.monthly !== null);

  return (
    <Page fixed className="ml-0">
      <div className="max-w-4xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <BillingPlanSelector
              canManageBilling={context.canManageBilling}
              canManagePortal={
                Boolean(context.canManageBilling) &&
                hasCurrentSubscription &&
                Boolean(organization.stripeCustomerId) &&
                Boolean(organization.subscriptionStatus)
              }
              hasCurrentSubscription={hasCurrentSubscription}
              currentBillingInterval={organization.billingInterval}
              currentPlanId={currentPlanId}
              plans={plans}
            />
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

