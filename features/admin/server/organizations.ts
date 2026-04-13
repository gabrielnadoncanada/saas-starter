import { db } from "@/lib/db/prisma";

import type {
  ListAdminOrganizationsQuery,
  OrgSubscription,
} from "../types/organizations.types";
import { adminOrganizationListInclude } from "../types/organizations.types";

export async function listAdminOrganizations(
  query: ListAdminOrganizationsQuery,
) {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;
  const search = query.search?.trim() || undefined;
  const sortBy = query.sortBy ?? "createdAt";
  const sortDirection = query.sortDirection ?? "desc";

  const where = search
    ? { name: { contains: search, mode: "insensitive" as const } }
    : {};

  const [organizations, total] = await Promise.all([
    db.organization.findMany({
      where,
      include: adminOrganizationListInclude,
      orderBy: { [sortBy]: sortDirection },
      take: limit,
      skip: offset,
    }),
    db.organization.count({ where }),
  ]);

  return { organizations, total };
}

export async function getAdminOrganizationDetail(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    include: adminOrganizationListInclude,
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  let subscription: OrgSubscription = null;

  if (organization.stripeCustomerId) {
    subscription = await db.subscription.findFirst({
      where: { stripeCustomerId: organization.stripeCustomerId },
      select: { id: true, plan: true, status: true, periodEnd: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return { organization, subscription };
}
