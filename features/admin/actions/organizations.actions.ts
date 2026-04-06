"use server";

import { revalidatePath } from "next/cache";

import {
  requireAdminAction,
  runAdminAction,
} from "@/features/auth/server/require-admin";
import { db } from "@/shared/lib/db/prisma";

import { getAdminOrganizationDetail } from "../server/get-admin-organization-detail";
import { listAdminOrganizations } from "../server/list-admin-organizations";
import type { ListAdminOrganizationsQuery } from "../types/admin-organizations.types";

export async function listOrganizationsAction(
  query: ListAdminOrganizationsQuery,
) {
  return runAdminAction(() => listAdminOrganizations(query));
}

export async function getOrganizationDetailAction(organizationId: string) {
  return runAdminAction(() => getAdminOrganizationDetail(organizationId));
}

export async function deleteOrganizationAction(organizationId: string) {
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
