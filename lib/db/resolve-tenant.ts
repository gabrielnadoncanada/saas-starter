import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

// Resolves the active organization id from the current request's session.
// Deduped per request via React cache — one session lookup per render pass,
// regardless of how many tenant-scoped queries fire downstream.
//
// `auth` is imported lazily to break the module-init cycle
// (prisma → extension → this file → auth-config → prisma.db).
//
// Returns `null` when there is no request context (cron, seed, worker) or no
// active org in the session. Callers that hit this path must wrap their work
// in `runAsAdmin` or `runInTenantScope` to proceed.
export const resolveActiveOrganizationIdFromSession = cache(
  async (): Promise<string | null> => {
    try {
      const { auth } = await import("@/lib/auth/auth-config");
      const reqHeaders = await headers();
      const session = await auth.api.getSession({ headers: reqHeaders });
      return session?.session?.activeOrganizationId ?? null;
    } catch {
      return null;
    }
  },
);
