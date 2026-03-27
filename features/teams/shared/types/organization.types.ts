import type { FormActionState } from "@/shared/types/form-action-state";
import type { OrgRole } from "@/shared/lib/db/enums";

export type OrganizationUserView = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type OrganizationMemberView = {
  id: string;
  role: OrgRole;
  joinedAt: string | null;
  user: OrganizationUserView;
};

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

export type OrganizationInvitationView = {
  id: string;
  email: string;
  role: OrgRole;
  invitedAt: string;
  expiresAt: string | null;
};

export type RefreshableFormState<
  TValues extends Record<string, unknown> = Record<string, never>,
> = FormActionState<TValues> & {
  refreshKey?: number;
};
