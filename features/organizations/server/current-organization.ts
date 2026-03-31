import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import type { CurrentOrganizationView } from "@/features/organizations/types/organization.types";
import type { OrganizationMemberView } from "@/features/organizations/types/membership.types";
import { auth } from "@/shared/lib/auth/auth-config";
import { getAuthSession } from "@/shared/lib/auth/get-session";
import { getPrimaryOrgRole, parseOrgRoles } from "@/shared/lib/db/enums";

type RawOrganizationMember = {
  id: string;
  role?: string | null;
  createdAt?: Date | string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
};

type RawOrganization = {
  id: string;
  name: string;
  stripeCustomerId?: string | null;
  members?: RawOrganizationMember[];
};

function toIsoString(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

function mapOrganizationMember(member: RawOrganizationMember): OrganizationMemberView {
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
  organization: RawOrganization,
  subscription: Awaited<ReturnType<typeof getOrganizationSubscriptionSnapshot>>,
): CurrentOrganizationView {
  return {
    id: organization.id,
    name: organization.name,
    billingInterval: subscription.billingInterval,
    planId: subscription.planId,
    pricingModel: subscription.pricingModel,
    stripeCustomerId:
      organization.stripeCustomerId ?? subscription.stripeCustomerId ?? null,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    subscriptionStatus: subscription.subscriptionStatus,
    members: (organization.members ?? []).map(mapOrganizationMember),
  };
}

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

  return mapCurrentOrganization(organization as RawOrganization, subscription);
}


