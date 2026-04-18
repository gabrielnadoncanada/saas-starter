import { describe, expect, it } from "vitest";

import {
  getTenantContext,
  runAsAdmin,
  runInTenantScope,
} from "@/lib/db/tenant-scope";

describe("tenant-scope context", () => {
  it("returns undefined when no context is set", async () => {
    await new Promise<void>((resolve) => {
      queueMicrotask(() => {
        expect(getTenantContext()).toBeUndefined();
        resolve();
      });
    });
  });

  it("runInTenantScope exposes the organization id inside the callback", async () => {
    await runInTenantScope("org-a", async () => {
      const ctx = getTenantContext();
      expect(ctx).toEqual({ kind: "tenant", organizationId: "org-a" });
    });
  });

  it("runAsAdmin exposes an admin-kind context", async () => {
    await runAsAdmin(async () => {
      expect(getTenantContext()).toEqual({ kind: "admin" });
    });
  });

  it("nested runAsAdmin inside runInTenantScope overrides the context", async () => {
    await runInTenantScope("org-a", async () => {
      expect(getTenantContext()?.kind).toBe("tenant");
      await runAsAdmin(async () => {
        expect(getTenantContext()).toEqual({ kind: "admin" });
      });
      expect(getTenantContext()?.kind).toBe("tenant");
    });
  });

  it("two concurrent scopes never see each other's context", async () => {
    const seen: string[] = [];
    async function work(orgId: string) {
      await runInTenantScope(orgId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const ctx = getTenantContext();
        if (ctx?.kind === "tenant") {
          seen.push(`${orgId}:${ctx.organizationId}`);
        }
      });
    }

    await Promise.all([work("org-a"), work("org-b")]);

    expect(seen.sort()).toEqual(["org-a:org-a", "org-b:org-b"]);
  });
});
