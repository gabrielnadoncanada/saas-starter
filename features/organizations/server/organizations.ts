import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getOrganizationSubscriptionSnapshot } from "@/features/billing/server/stripe/stripe-subscriptions";
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
  hasAnyOrgRole,
  hasOrgRole,
  type OrgRole,
  parseOrgRoles,
} from "@/shared/lib/db/enums";

// --- Active membership (session / guards) ---

export type ActiveOrganizationMembership = {
  organizationId: string;
  roles: OrgRole[];
  primaryRole: OrgRole;
};

export class OrganizationMembershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationMembershipError";
  }
}

/** Resolve the active organization id (auto-selects the first org if none is set). Use in layouts only. */
export async function ensureActiveOrganization(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  if (session.session.activeOrganizationId) {
    return session.session.activeOrganizationId;
  }

  const reqHeaders = await headers();
  const organizations = await auth.api.listOrganizations({
    headers: reqHeaders,
  });
  const organizationId = organizations?.[0]?.id ?? null;

  if (!organizationId) {
    return null;
  }

  await auth.api.setActiveOrganization({
    headers: reqHeaders,
    body: { organizationId },
  });

  return organizationId;
}

export async function getActiveOrganizationMembership(): Promise<ActiveOrganizationMembership | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const member = await auth.api.getActiveMember({
    headers: await headers(),
  });

  if (!member) {
    return null;
  }

  const roles = parseOrgRoles(member.role);

  if (roles.length === 0) {
    return null;
  }

  return {
    organizationId: member.organizationId,
    roles,
    primaryRole: getPrimaryOrgRole(roles),
  };
}

/** Guard for server actions/mutations: throws if the user has no active org membership. */
export async function requireActiveOrganizationMembership() {
  const membership = await getActiveOrganizationMembership();

  if (!membership?.organizationId) {
    throw new OrganizationMembershipError(
      "User is not part of an organization",
    );
  }

  return membership;
}

type RequireOrgRoleOptions = {
  /** When set, membership/role failures redirect here instead of throwing. */
  redirectTo?: string;
};

/** Guard for server actions that require specific roles (e.g. owner, admin). */
export async function requireActiveOrganizationRole(
  allowedRoles: OrgRole[],
  options?: RequireOrgRoleOptions,
) {
  try {
    const membership = await requireActiveOrganizationMembership();

    if (!hasAnyOrgRole(membership.roles, allowedRoles)) {
      throw new OrganizationMembershipError(
        "You do not have permission to perform this action",
      );
    }

    return membership;
  } catch (error) {
    if (
      options?.redirectTo &&
      error instanceof OrganizationMembershipError
    ) {
      redirect(options.redirectTo);
    }

    throw error;
  }
}

// --- Current organization (full view + billing snapshot) ---

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
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    plan: subscription.plan,
    periodEnd: toIsoString(subscription.periodEnd),
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
