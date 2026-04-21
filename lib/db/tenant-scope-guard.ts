import { TenantScopeError } from "./tenant-scope";

// Models that carry `organizationId` and must be tenant-scoped on every query.
// Member and Invitation are intentionally excluded — they are owned by
// better-auth's organization plugin, which manages its own scoping via the
// authenticated user's memberships.
export const TENANT_SCOPED_MODELS = [
  "Task",
  "AiConversation",
  "UsageCounter",
  "ActivityEvent",
  "StoredFile",
] as const;

export type ScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

type AnyRecord = Record<string, unknown>;

const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

const WHERE_WRITE_OPS = new Set([
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
]);

const CREATE_OPS = new Set(["create"]);
const CREATE_MANY_OPS = new Set(["createMany", "createManyAndReturn"]);

function mergeWhereOrg(where: unknown, orgId: string): AnyRecord {
  const base = (where as AnyRecord | null | undefined) ?? {};
  const existing = base.organizationId;
  if (
    typeof existing === "string" &&
    existing.length > 0 &&
    existing !== orgId
  ) {
    throw new TenantScopeError(
      `where.organizationId=${existing} conflicts with tenant context=${orgId}`,
    );
  }
  return { ...base, organizationId: orgId };
}

function mergeDataOrg(data: unknown, orgId: string): AnyRecord {
  const base = (data as AnyRecord | null | undefined) ?? {};
  const existing = base.organizationId;
  if (
    typeof existing === "string" &&
    existing.length > 0 &&
    existing !== orgId
  ) {
    throw new TenantScopeError(
      `data.organizationId=${existing} conflicts with tenant context=${orgId}`,
    );
  }
  return { ...base, organizationId: orgId };
}

function mergeCreateManyData(data: unknown, orgId: string): unknown {
  if (Array.isArray(data)) {
    return data.map((row) => mergeDataOrg(row, orgId));
  }
  return mergeDataOrg(data, orgId);
}

// Pure: inject the given orgId into args. Does not touch AsyncLocalStorage.
// The extension (or caller) decides where orgId comes from — ALS context,
// session lookup, or elsewhere — and passes it in.
export function applyTenantScope(
  _model: ScopedModel,
  operation: string,
  rawArgs: unknown,
  orgId: string,
): unknown {
  const args = { ...((rawArgs as AnyRecord | null | undefined) ?? {}) };

  if (READ_OPS.has(operation) || WHERE_WRITE_OPS.has(operation)) {
    args.where = mergeWhereOrg(args.where, orgId);
  }

  if (CREATE_OPS.has(operation)) {
    args.data = mergeDataOrg(args.data, orgId);
  }

  if (CREATE_MANY_OPS.has(operation)) {
    args.data = mergeCreateManyData(args.data, orgId);
  }

  if (operation === "upsert") {
    args.where = mergeWhereOrg(args.where, orgId);
    args.create = mergeDataOrg(args.create, orgId);
  }

  return args;
}
