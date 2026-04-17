import { headers } from "next/headers";

import { accountFlags } from "@/config/account.config";
import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";

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

  const isPersonal = !accountFlags.enableTeamFeatures;
  const orgName = isPersonal ? `Personal` : `${email}'s Team`;

  const organization = await auth.api.createOrganization({
    headers: reqHeaders,
    body: {
      name: orgName,
      slug: crypto.randomUUID(),
    },
  });

  await runAsAdmin(() =>
    db.organization.update({
      where: { id: organization.id },
      data: { type: isPersonal ? "PERSONAL" : "TEAM" },
    }),
  );

  await auth.api.setActiveOrganization({
    headers: reqHeaders,
    body: { organizationId: organization.id },
  });

  return organization.id;
}
