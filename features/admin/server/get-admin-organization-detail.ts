import { db } from "@/shared/lib/db/prisma";

import type { OrgSubscription } from "../types/admin-organizations.types";
import { adminOrganizationListInclude } from "../types/admin-organizations.types";

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
