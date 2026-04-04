import { headers } from "next/headers";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
import type {
  CurrentOrganizationView,
  OrganizationMemberView,
} from "@/features/organizations/types";
import { auth } from "@/shared/lib/auth/auth-config";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getAuthSession } from "@/shared/lib/auth/get-session";
import {
  getPrimaryOrgRole,
  hasOrgRole,
  type OrgRole,
  parseOrgRoles,
} from "@/shared/lib/db/enums";

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

export type CurrentOrganizationContext = {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: NonNullable<Awaited<ReturnType<typeof getCurrentOrganization>>>;
  currentMember: NonNullable<
    NonNullable<
      Awaited<ReturnType<typeof getCurrentOrganization>>
    >["members"][number]
  >;
  roles: OrgRole[];
  primaryRole: OrgRole;
  canInviteMembers: boolean;
  canManageBilling: boolean;
  canManageMembers: boolean;
  canTransferOwnership: boolean;
};

function toIsoString(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

function mapOrganizationMember(
  member: RawOrganizationMember,
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
    canInviteMembers: isOwner,
    canManageBilling: isOwner,
    canManageMembers: isOwner,
    canTransferOwnership: isOwner,
  };
}
