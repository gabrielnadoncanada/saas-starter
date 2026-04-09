import type {
  BillingInterval,
  PricingModel,
} from "@/shared/config/billing.config";
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
  cancelAtPeriodEnd: boolean;
  plan: string | null;
  periodEnd: string | null;
  pricingModel: PricingModel | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  members: OrganizationMemberView[];
};
