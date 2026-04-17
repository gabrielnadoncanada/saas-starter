import { beforeEach, describe, expect, it } from "vitest";

import {
  runAsAdmin,
  runInTenantScope,
  TenantScopeError,
} from "@/lib/db/tenant-scope";
import {
  applyTenantScope,
  TENANT_SCOPED_MODELS,
} from "@/lib/db/tenant-scope-guard";

const TENANT_A = "org-aaa";
const TENANT_B = "org-bbb";

function scoped(operation: string, args: unknown) {
  return applyTenantScope("Task", operation, args);
}

describe("tenant-scope extension — fail-closed", () => {
  it("throws on read when no context is set", () => {
    expect(() => scoped("findMany", { where: { status: "TODO" } })).toThrow(
      TenantScopeError,
    );
  });

  it("throws on write when no context is set", () => {
    expect(() => scoped("create", { data: { title: "leak" } })).toThrow(
      TenantScopeError,
    );
  });

  it("throws for every scoped model", () => {
    for (const model of TENANT_SCOPED_MODELS) {
      expect(() => applyTenantScope(model, "findMany", {})).toThrow(
        TenantScopeError,
      );
    }
  });
});

describe("tenant-scope extension — tenant scope enforcement", () => {
  it("injects organizationId into findMany.where", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("findMany", { where: { status: "TODO" } }) as {
        where: { organizationId: string; status: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
      expect(args.where.status).toBe("TODO");
    });
  });

  it("injects organizationId into findUnique.where", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("findUnique", { where: { id: 5 } }) as {
        where: { id: number; organizationId: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
      expect(args.where.id).toBe(5);
    });
  });

  it("injects organizationId into update.where", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("update", {
        where: { id: 5 },
        data: { status: "DONE" },
      }) as {
        where: { id: number; organizationId: string };
        data: { status: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
      expect(args.data.status).toBe("DONE");
    });
  });

  it("injects organizationId into delete.where", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("delete", { where: { id: 5 } }) as {
        where: { organizationId: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
    });
  });

  it("injects organizationId into create.data", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("create", {
        data: { title: "Ship", status: "TODO" },
      }) as { data: { organizationId: string; title: string } };
      expect(args.data.organizationId).toBe(TENANT_A);
      expect(args.data.title).toBe("Ship");
    });
  });

  it("injects organizationId into every row of createMany.data", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("createMany", {
        data: [{ title: "one" }, { title: "two" }],
      }) as { data: Array<{ organizationId: string; title: string }> };
      expect(args.data.map((d) => d.organizationId)).toEqual([
        TENANT_A,
        TENANT_A,
      ]);
    });
  });

  it("injects organizationId into upsert.where and upsert.create", async () => {
    await runInTenantScope(TENANT_A, async () => {
      const args = scoped("upsert", {
        where: { id: 5 },
        create: { title: "Ship" },
        update: { status: "DONE" },
      }) as {
        where: { organizationId: string };
        create: { organizationId: string };
        update: { status: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
      expect(args.create.organizationId).toBe(TENANT_A);
      expect(args.update).toEqual({ status: "DONE" });
    });
  });
});

describe("tenant-scope extension — cross-tenant guards", () => {
  it("rejects reading another tenant's rows via where.organizationId", async () => {
    await runInTenantScope(TENANT_A, async () => {
      expect(() =>
        scoped("findMany", { where: { organizationId: TENANT_B } }),
      ).toThrow(TenantScopeError);
    });
  });

  it("rejects creating a row in another tenant", async () => {
    await runInTenantScope(TENANT_A, async () => {
      expect(() =>
        scoped("create", {
          data: { organizationId: TENANT_B, title: "hijack" },
        }),
      ).toThrow(TenantScopeError);
    });
  });

  it("rejects update where.organizationId targeting another tenant", async () => {
    await runInTenantScope(TENANT_A, async () => {
      expect(() =>
        scoped("update", {
          where: { id: 5, organizationId: TENANT_B },
          data: { status: "DONE" },
        }),
      ).toThrow(TenantScopeError);
    });
  });

  it("rejects delete where.organizationId targeting another tenant", async () => {
    await runInTenantScope(TENANT_A, async () => {
      expect(() =>
        scoped("delete", {
          where: { id: 5, organizationId: TENANT_B },
        }),
      ).toThrow(TenantScopeError);
    });
  });

  it("rejects createMany when any row targets another tenant", async () => {
    await runInTenantScope(TENANT_A, async () => {
      expect(() =>
        scoped("createMany", {
          data: [
            { title: "mine" },
            { title: "hijack", organizationId: TENANT_B },
          ],
        }),
      ).toThrow(TenantScopeError);
    });
  });
});

describe("tenant-scope extension — admin bypass", () => {
  it("does not modify args under admin context", async () => {
    await runAsAdmin(async () => {
      const input = { where: { organizationId: TENANT_B } };
      const args = scoped("findMany", input);
      expect(args).toEqual(input);
    });
  });

  it("allows cross-tenant delete under admin context", async () => {
    await runAsAdmin(async () => {
      const args = scoped("deleteMany", {});
      expect(args).toEqual({});
    });
  });
});

describe("tenant-scope extension — isolation boundary", () => {
  let sideEffects: string[] = [];

  beforeEach(() => {
    sideEffects = [];
  });

  it("two concurrent tenant scopes never see each other's context", async () => {
    async function tenantWork(orgId: string) {
      await runInTenantScope(orgId, async () => {
        // Yield to let the other scope run.
        await new Promise((resolve) => setTimeout(resolve, 0));
        const args = scoped("findMany", {}) as {
          where: { organizationId: string };
        };
        sideEffects.push(`${orgId}:${args.where.organizationId}`);
      });
    }

    await Promise.all([tenantWork(TENANT_A), tenantWork(TENANT_B)]);

    expect(sideEffects.sort()).toEqual([
      `${TENANT_A}:${TENANT_A}`,
      `${TENANT_B}:${TENANT_B}`,
    ]);
  });
});
