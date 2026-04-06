import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscription-snapshot";
import type {
  CurrentOrganizationView,
  OrganizationMemberView,
} from "@/features/organizations/types";
import { auth } from "@/shared/lib/auth/auth-config";
import type { FullOrganization } from "@/shared/lib/auth/better-auth-inferred-types";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getAuthSession } from "@/shared/lib/auth/get-session";
import { toIsoString } from "@/shared/lib/date/to-iso-string";
import {
  getPrimaryOrgRole,
  hasOrgRole,
  type OrgRole,
  parseOrgRoles,
} from "@/shared/lib/db/enums";

type OrganizationMemberFromApi = NonNullable<
  FullOrganization["members"]
>[number];

type CurrentOrganization = NonNullable<
  Awaited<ReturnType<typeof getCurrentOrganization>>
>;

export type CurrentOrganizationContext = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: CurrentOrganization;
  currentMember: NonNullable<CurrentOrganization["members"][number]>;
  roles: OrgRole[];
  primaryRole: OrgRole;
  isOwner: boolean;
};

function mapOrganizationMember(
  member: OrganizationMemberFromApi,
): OrganizationMemberView {
  return {
    id: member.id,
    roles: parseOrgRoles(member.role),
    primaryRole: getPrimaryOrgRole(member.role),
    joinedAt: toIsoString(member.createdAt),
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image ?? null,
    },
  };
}

function mapCurrentOrganization(
  organization: FullOrganization,
  subscription: Awaited<ReturnType<typeof getOrganizationSubscriptionSnapshot>>,
): CurrentOrganizationView {
  return {
    id: organization.id,
    name: organization.name,
    billingInterval: subscription.billingInterval,
    plan: subscription.plan,
    pricingModel: subscription.pricingModel,
    stripeCustomerId:
      organization.stripeCustomerId ?? subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    subscriptionStatus: subscription.subscriptionStatus,
    members: (organization.members ?? []).map(mapOrganizationMember),
  };
}

/** Fetch the active organization with members and subscription snapshot. Use in pages/layouts that render org data. */
export async function getCurrentOrganization(): Promise<CurrentOrganizationView | null> {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  const reqHeaders = await headers();
  const orgId = session.session.activeOrganizationId ?? null;

  if (!orgId) {
    return null;
  }

  const [organization, subscription] = await Promise.all([
    auth.api.getFullOrganization({
      query: { organizationId: orgId },
      headers: reqHeaders,
    }),
    getOrganizationSubscriptionSnapshot(orgId),
  ]);

  if (!organization) {
    return null;
  }

  return mapCurrentOrganization(organization, subscription);
}

/** Full page context: organization + current user + roles + isOwner. Use in settings/org pages that need the viewer's membership. */
export async function getCurrentOrganizationContext(): Promise<CurrentOrganizationContext | null> {
  const [user, organization] = await Promise.all([
    getCurrentUser(),
    getCurrentOrganization(),
  ]);

  if (!user || !organization) {
    return null;
  }

  const currentMember = organization.members.find(
    (member) => member.user.id === user.id,
  );

  if (!currentMember) {
    return null;
  }

  const roles = currentMember.roles;
  const primaryRole = currentMember.primaryRole;
  const isOwner = hasOrgRole(roles, "owner");

  return {
    user,
    organization,
    currentMember,
    roles,
    primaryRole,
    isOwner,
  };
}
