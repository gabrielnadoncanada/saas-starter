import { headers } from "next/headers";
import { cache } from "react";

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
  parseOrgRoles,
} from "@/shared/lib/db/enums";

type OrganizationMemberFromApi = NonNullable<
  FullOrganization["members"]
>[number];

export type CurrentOrganizationContext = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: CurrentOrganizationView;
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
export const getCurrentOrganization = cache(
  async (): Promise<CurrentOrganizationView | null> => {
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
  },
);

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

  return {
    user,
    organization,
    isOwner: hasOrgRole(currentMember.roles, "owner"),
  };
}
