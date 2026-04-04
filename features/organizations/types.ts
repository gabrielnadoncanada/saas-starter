import type { BillingInterval } from "@/shared/config/billing.config";
import type { OrgRole } from "@/shared/lib/db/enums";

export type OrganizationUserView = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type OrganizationMemberView = {
  id: string;
  roles: OrgRole[];
  primaryRole: OrgRole;
  joinedAt: string | null;
  user: OrganizationUserView;
};

export type OrganizationInvitationView = {
  id: string;
  email: string;
  roles: OrgRole[];
  primaryRole: OrgRole;
  invitedAt: string;
  expiresAt: string | null;
};

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

export type OrgMember = {
  id: string;
  role: string;
  userId: string;
  createdAt: Date;
  user: { email: string; name: string | null; image?: string | null };
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  stripeCustomerId: string | null;
  members: OrgMember[];
  _count: { members: number };
};

export type OrgSubscription = {
  id: string;
  plan: string;
  status: string;
  periodEnd: Date | null;
} | null;

export type ListAdminOrganizationsQuery = {
  limit?: number;
  offset?: number;
  search?: string;
};
