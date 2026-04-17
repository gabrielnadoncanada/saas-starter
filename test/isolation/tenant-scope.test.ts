import { describe, expect, it } from "vitest";

import {
  getTenantContext,
  runAsAdmin,
  runInTenantScope,
  setTenantContext,
  TenantScopeError,
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

  it("setTenantContext establishes a tenant context for the current task", async () => {
    await runInTenantScope("isolated", async () => {
      // Inside an isolated store. setTenantContext with the same id is a no-op.
      setTenantContext("isolated");
      expect(getTenantContext()).toEqual({
        kind: "tenant",
        organizationId: "isolated",
      });
    });
  });

  it("setTenantContext throws when switching tenants within the same request", async () => {
    await runInTenantScope("org-a", async () => {
      expect(() => setTenantContext("org-b")).toThrow(TenantScopeError);
    });
  });

  it("setTenantContext is a no-op under admin context", async () => {
    await runAsAdmin(async () => {
      expect(() => setTenantContext("anything")).not.toThrow();
      expect(getTenantContext()).toEqual({ kind: "admin" });
    });
  });
});
