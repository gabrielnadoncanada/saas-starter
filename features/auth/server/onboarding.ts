import { headers } from "next/headers";

import { accountFlags } from "@/config/account.config";
import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";

export async function ensureUserOrganization(email: string) {
  const reqHeaders = await headers();
  const [session, existingOrganizations] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    auth.api.listOrganizations({ headers: reqHeaders }),
  ]);

  if (existingOrganizations?.[0]?.id) {
    const activeId = session?.session?.activeOrganizationId ?? null;
    const isActiveValid =
      activeId !== null &&
      existingOrganizations.some((org) => org.id === activeId);

    if (!isActiveValid) {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: existingOrganizations[0].id },
      });
      return existingOrganizations[0].id;
    }

    return activeId;
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
