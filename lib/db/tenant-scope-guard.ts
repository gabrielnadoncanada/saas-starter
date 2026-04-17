import { getTenantContext, TenantScopeError } from "./tenant-scope";

// Models that carry `organizationId` and must be tenant-scoped on every query.
// Member and Invitation are intentionally excluded — they are owned by
// better-auth's organization plugin, which manages its own scoping via the
// authenticated user's memberships.
export const TENANT_SCOPED_MODELS = [
  "Task",
  "AiConversation",
  "UsageCounter",
  "ActivityEvent",
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

export function applyTenantScope(
  model: ScopedModel,
  operation: string,
  rawArgs: unknown,
): unknown {
  const ctx = getTenantContext();

  if (!ctx) {
    throw new TenantScopeError(
      `${model}.${operation} requires tenant context. ` +
        `Call requireActiveOrganizationMembership() or wrap system code in runAsAdmin().`,
    );
  }

  if (ctx.kind === "admin") {
    return rawArgs;
  }

  const orgId = ctx.organizationId;
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
