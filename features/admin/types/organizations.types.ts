import type { Prisma } from "@prisma/client";

/** Shared include for org list + detail so Prisma infers one row type. */
export const adminOrganizationListInclude = {
  members: {
    orderBy: { createdAt: "asc" as const },
    include: {
      user: { select: { email: true, name: true, image: true } },
    },
  },
  _count: { select: { members: true } },
} as const satisfies Prisma.OrganizationInclude;

export type AdminOrganization = Prisma.OrganizationGetPayload<{
  include: typeof adminOrganizationListInclude;
}>;

export type OrgMember = AdminOrganization["members"][number];

export type OrgSubscription = Prisma.SubscriptionGetPayload<{
  select: {
    id: true;
    plan: true;
    status: true;
    periodEnd: true;
  };
}> | null;

export type ListAdminOrganizationsQuery = {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "createdAt" | "name";
  sortDirection?: "asc" | "desc";
};
