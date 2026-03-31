import "server-only";

import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { getAuthSession } from "@/shared/lib/auth/get-session";

/**
 * Ensures the session has an active organization.
 * If none is set, activates the user's first organization.
 * Returns the active organization ID, or null if the user has no organizations.
 */
export async function ensureActiveOrganization(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  if (session.session.activeOrganizationId) {
    return session.session.activeOrganizationId;
  }

  const reqHeaders = await headers();
  const orgs = await auth.api.listOrganizations({ headers: reqHeaders });
  const orgId = orgs?.[0]?.id ?? null;

  if (!orgId) {
    return null;
  }

  await auth.api.setActiveOrganization({
    headers: reqHeaders,
    body: { organizationId: orgId },
  });

  return orgId;
}
