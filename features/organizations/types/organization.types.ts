import type { OrganizationMemberView } from "@/features/organizations/types/membership.types";

export type CurrentOrganizationView = {
  id: string;
  name: string;
  billingInterval: string | null;
  planId: string | null;
  pricingModel: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  members: OrganizationMemberView[];
};
