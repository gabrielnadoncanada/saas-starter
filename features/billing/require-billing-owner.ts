import { redirect } from "next/navigation";

import {
  OrganizationMembershipError,
  requireActiveOrganizationRole,
} from "@/features/organizations/server/organization-membership";
import { routes } from "@/shared/constants/routes";

export async function requireBillingOwner() {
  try {
    await requireActiveOrganizationRole(["owner"]);
  } catch (error) {
    if (error instanceof OrganizationMembershipError) {
      redirect(routes.settings.members);
    }

    throw error;
  }
}
