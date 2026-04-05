import { db } from "@/shared/lib/db/prisma";

export async function getAdminOrganizationDetail(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { members: true } },
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  let subscription: {
    id: string;
    plan: string;
    status: string;
    periodEnd: Date | null;
  } | null = null;

  if (organization.stripeCustomerId) {
    subscription = await db.subscription.findFirst({
      where: { stripeCustomerId: organization.stripeCustomerId },
      select: { id: true, plan: true, status: true, periodEnd: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return { organization, subscription };
}
