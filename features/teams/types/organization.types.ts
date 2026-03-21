import type { OrgRole } from "@/shared/lib/db/enums";

export type OrganizationMemberView = {
  id: string;
  role: OrgRole;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type OrganizationView = {
  id: string;
  billingInterval?: string | null;
  planId?: string | null;
  pricingModel?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus: string | null;
  members: OrganizationMemberView[];
};

export type OrganizationInvitationView = {
  id: string;
  email: string;
  role: OrgRole;
  invitedAt: string;
};
