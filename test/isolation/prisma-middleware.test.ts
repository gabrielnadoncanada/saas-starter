import { describe, expect, it } from "vitest";

import { TenantScopeError } from "@/lib/db/tenant-scope";
import {
  applyTenantScope,
  TENANT_SCOPED_MODELS,
} from "@/lib/db/tenant-scope-guard";

const TENANT_A = "org-aaa";
const TENANT_B = "org-bbb";

function scoped(operation: string, args: unknown, orgId = TENANT_A) {
  return applyTenantScope("Task", operation, args, orgId);
}

describe("applyTenantScope — injects orgId", () => {
  it("covers every scoped model", () => {
    for (const model of TENANT_SCOPED_MODELS) {
      const args = applyTenantScope(model, "findMany", {}, TENANT_A) as {
        where: { organizationId: string };
      };
      expect(args.where.organizationId).toBe(TENANT_A);
    }
  });

  it("injects organizationId into findMany.where", () => {
    const args = scoped("findMany", { where: { status: "TODO" } }) as {
      where: { organizationId: string; status: string };
    };
    expect(args.where.organizationId).toBe(TENANT_A);
    expect(args.where.status).toBe("TODO");
  });

  it("injects organizationId into findUnique.where", () => {
    const args = scoped("findUnique", { where: { id: 5 } }) as {
      where: { id: number; organizationId: string };
    };
    expect(args.where.organizationId).toBe(TENANT_A);
    expect(args.where.id).toBe(5);
  });

  it("injects organizationId into update.where", () => {
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

  it("injects organizationId into delete.where", () => {
    const args = scoped("delete", { where: { id: 5 } }) as {
      where: { organizationId: string };
    };
    expect(args.where.organizationId).toBe(TENANT_A);
  });

  it("injects organizationId into create.data", () => {
    const args = scoped("create", {
      data: { title: "Ship", status: "TODO" },
    }) as { data: { organizationId: string; title: string } };
    expect(args.data.organizationId).toBe(TENANT_A);
    expect(args.data.title).toBe("Ship");
  });

  it("injects organizationId into every row of createMany.data", () => {
    const args = scoped("createMany", {
      data: [{ title: "one" }, { title: "two" }],
    }) as { data: Array<{ organizationId: string; title: string }> };
    expect(args.data.map((d) => d.organizationId)).toEqual([
      TENANT_A,
      TENANT_A,
    ]);
  });

  it("injects organizationId into upsert.where and upsert.create", () => {
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

describe("applyTenantScope — cross-tenant guards", () => {
  it("rejects reading another tenant's rows via where.organizationId", () => {
    expect(() =>
      scoped("findMany", { where: { organizationId: TENANT_B } }),
    ).toThrow(TenantScopeError);
  });

  it("rejects creating a row in another tenant", () => {
    expect(() =>
      scoped("create", {
        data: { organizationId: TENANT_B, title: "hijack" },
      }),
    ).toThrow(TenantScopeError);
  });

  it("rejects update where.organizationId targeting another tenant", () => {
    expect(() =>
      scoped("update", {
        where: { id: 5, organizationId: TENANT_B },
        data: { status: "DONE" },
      }),
    ).toThrow(TenantScopeError);
  });

  it("rejects delete where.organizationId targeting another tenant", () => {
    expect(() =>
      scoped("delete", {
        where: { id: 5, organizationId: TENANT_B },
      }),
    ).toThrow(TenantScopeError);
  });

  it("rejects createMany when any row targets another tenant", () => {
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
