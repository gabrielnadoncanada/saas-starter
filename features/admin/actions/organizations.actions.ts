"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction } from "@/features/auth/server/require-admin";
import { db } from "@/lib/db/prisma";
import { throwIfDemo } from "@/lib/demo";

import { getAdminOrganizationDetail } from "../server/organizations";

export async function getOrganizationDetailAction(organizationId: string) {
  await requireAdminAction();
  return getAdminOrganizationDetail(organizationId);
}

export async function deleteOrganizationAction(organizationId: string) {
  throwIfDemo();
  const adminId = await requireAdminAction();

  const membership = await db.member.findFirst({
    where: { organizationId, userId: adminId },
  });

  if (membership) {
    throw new Error("You cannot delete an organization you belong to");
  }

  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });

  if (organization?.stripeCustomerId) {
    const activeSubscription = await db.subscription.findFirst({
      where: {
        stripeCustomerId: organization.stripeCustomerId,
        status: { in: ["active", "trialing"] },
      },
    });

    if (activeSubscription) {
      throw new Error(
        "Cannot delete an organization with an active subscription. Cancel the subscription first.",
      );
    }
  }

  await db.organization.delete({ where: { id: organizationId } });

  revalidatePath("/admin");
  revalidatePath("/admin/organizations");
}
