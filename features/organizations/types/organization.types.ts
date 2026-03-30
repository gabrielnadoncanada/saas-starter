import type { BillingInterval } from "@/features/billing/plans";
import type { OrganizationMemberView } from "@/features/organizations/types/membership.types";

export type CurrentOrganizationView = {
  id: string;
  name: string;
  billingInterval: BillingInterval | null;
  planId: string | null;
  pricingModel: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  members: OrganizationMemberView[];
};
