import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { TENANT_SCOPED_MODELS } from "@/lib/db/tenant-scope-guard";

// Models that carry `organizationId` but are intentionally NOT scoped by the
// Prisma extension. Any addition to this list is a security decision — review
// carefully and document the reason.
const SCOPE_EXEMPT_MODELS = new Set([
  // Owned by better-auth's organization plugin; scoped via the authenticated
  // user's memberships, not by our extension.
  "Member",
  "Invitation",
]);

describe("tenant-scope — coverage", () => {
  it("every model with an organizationId field is scoped or explicitly exempt", () => {
    const scoped = new Set<string>(TENANT_SCOPED_MODELS);
    const missing: string[] = [];

    for (const model of Prisma.dmmf.datamodel.models) {
      const hasOrgId = model.fields.some(
        (field) => field.name === "organizationId",
      );
      if (!hasOrgId) continue;
      if (scoped.has(model.name)) continue;
      if (SCOPE_EXEMPT_MODELS.has(model.name)) continue;
      missing.push(model.name);
    }

    expect(
      missing,
      `These models carry organizationId but are neither in TENANT_SCOPED_MODELS nor exempt. ` +
        `Add them to lib/db/tenant-scope-guard.ts and register a guard in lib/db/tenant-scope-extension.ts, ` +
        `or document them in SCOPE_EXEMPT_MODELS with a reason.`,
    ).toEqual([]);
  });

  it("every name in TENANT_SCOPED_MODELS exists in the Prisma schema", () => {
    const schemaModels = new Set(
      Prisma.dmmf.datamodel.models.map((model) => model.name),
    );
    const unknown = TENANT_SCOPED_MODELS.filter(
      (name) => !schemaModels.has(name),
    );
    expect(
      unknown,
      `TENANT_SCOPED_MODELS references models that no longer exist in the Prisma schema.`,
    ).toEqual([]);
  });
});
