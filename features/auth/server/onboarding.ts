import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import { accountFlags } from "@/shared/config/account.config";

export async function ensureUserWorkspace(email: string) {
  const reqHeaders = await headers();
  const existingOrganizations = await auth.api.listOrganizations({
    headers: reqHeaders,
  });

  if (existingOrganizations?.[0]?.id) {
    await auth.api.setActiveOrganization({
      headers: reqHeaders,
      body: { organizationId: existingOrganizations[0].id },
    });
    return existingOrganizations[0].id;
  }

  const orgName = accountFlags.enableTeamFeatures
    ? `${email}'s Team`
    : `Personal`;

  const organization = await auth.api.createOrganization({
    headers: reqHeaders,
    body: {
      name: orgName,
      slug: crypto.randomUUID(),
    },
  });

  await auth.api.setActiveOrganization({
    headers: reqHeaders,
    body: { organizationId: organization.id },
  });

  return organization.id;
}
