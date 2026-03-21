import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth";

export async function ensureUserWorkspace(email: string) {
  const reqHeaders = await headers();
  const existingOrganizations = await auth.api.listOrganizations({
    headers: reqHeaders,
  });

  if (existingOrganizations?.[0]?.id) {
    return existingOrganizations[0].id;
  }

  const organization = await auth.api.createOrganization({
    headers: reqHeaders,
    body: {
      name: `${email}'s Team`,
      slug: crypto.randomUUID(),
    },
  });

  return organization.id;
}
