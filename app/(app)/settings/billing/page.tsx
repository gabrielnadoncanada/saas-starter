import { redirect } from "next/navigation";

import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { routes } from "@/constants/routes";
import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";
import { isTrialingSubscription } from "@/features/billing/plans";
import { getBillingPageData } from "@/features/billing/server/get-billing-page-data";
import { formatShortDate } from "@/lib/date/format-date";

export default async function SettingsBillingPage() {
  const data = await getBillingPageData();

  if (!data) {
    redirect(routes.auth.login);
  }

  const { context, entitlements, hasSubscription, plans } = data;
  const isTrialing = isTrialingSubscription(entitlements.subscriptionStatus);
  const trialEndsOn = formatShortDate(entitlements.trialEnd);

  const billingStatusText = isTrialing
    ? trialEndsOn
      ? `Trial active until ${trialEndsOn}`
      : "Trial active"
    : hasSubscription && entitlements.stripeCustomerId
      ? "Manage subscription and invoices in the customer portal"
      : "Pick a plan below to enable subscription billing";

  return (
    <Page>
      <PageHeader eyebrow="Settings · Billing">
        <PageTitle>Billing</PageTitle>
        <PageDescription>
          Choose a plan that fits your team. Upgrade or downgrade any time.
        </PageDescription>
      </PageHeader>

      <div className="max-w-5xl space-y-5">
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="label-mono">Current plan</p>
              {isTrialing ? (
                <span className="inline-flex items-center gap-1.5 border border-brand/40 bg-brand/5 px-2 py-0.5 label-mono text-brand">
                  <span aria-hidden className="size-1.5 bg-brand" />
                  Trial
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
              {entitlements.planName}
            </p>
            {isTrialing && trialEndsOn ? (
              <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                Trial ends {trialEndsOn}
              </p>
            ) : null}
          </div>
          <div className="bg-card p-5">
            <p className="label-mono">Billing status</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {billingStatusText}.
            </p>
          </div>
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
      </div>
    </Page>
  );
}
