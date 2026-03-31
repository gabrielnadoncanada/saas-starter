import "server-only";

import { getActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export async function requireCurrentOrganizationId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const membership = await getActiveOrganizationMembership(user.id);

  if (!membership?.organizationId) {
    throw new Error("User is not part of an organization");
  }

  return membership.organizationId;
}
