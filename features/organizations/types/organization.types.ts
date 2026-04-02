import type { OrganizationMemberView } from "@/features/organizations/types/membership.types";
import type { BillingInterval } from "@/shared/config/billing.config";

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
