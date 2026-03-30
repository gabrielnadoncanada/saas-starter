import { redirect } from "next/navigation";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import { getPricingPlans, isPlanId } from "@/features/billing/plans";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Page } from "@/shared/components/layout/page";
import { routes } from "@/shared/constants/routes";

export default async function SettingsBillingPage() {
  const context = await getCurrentOrganizationContext();

  if (!context) {
    redirect(routes.auth.login);
  }

  const { organization } = context;
  const currentPlanId =
    organization.planId && isPlanId(organization.planId)
      ? organization.planId
      : "free";
  const plans = getPricingPlans()
    .map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      pricingModel: plan.pricingModel,
      monthly: plan.prices.month ?? null,
      yearly: plan.prices.year ?? null,
    }))
    .filter((plan) => plan.monthly !== null);

  return (
    <Page fixed>
      <div className="max-w-4xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Gerez votre forfait d'equipe</CardTitle>
            <CardDescription>
              Choisissez un plan qui repond aux besoins de votre equipe. Vous
              pouvez passer a un plan superieur ou inferieur a tout moment.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <BillingPlanSelector
              canManageBilling={context.canManageBilling}
              canManagePortal={
                Boolean(context.canManageBilling) &&
                Boolean(organization.stripeCustomerId) &&
                Boolean(organization.subscriptionStatus)
              }
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
