import "server-only";

import { getActiveOrganizationMembership } from "@/features/organizations/server/organization-membership";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

type GetActiveOrganizationIdOptions = {
  required?: boolean;
};

export async function getActiveOrganizationId(options: {
  required: true;
}): Promise<string>;
export async function getActiveOrganizationId(
  options?: GetActiveOrganizationIdOptions,
): Promise<string | null>;
export async function getActiveOrganizationId(
  options: GetActiveOrganizationIdOptions = {},
): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user) {
    if (options.required) {
      throw new Error("User is not authenticated");
    }

    return null;
  }

  const membership = await getActiveOrganizationMembership(user.id);
  const organizationId = membership?.organizationId ?? null;

  if (!organizationId && options.required) {
    throw new Error("User is not part of an organization");
  }

  return organizationId;
}
