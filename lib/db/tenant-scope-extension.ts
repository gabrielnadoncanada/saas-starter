import { Prisma } from "@prisma/client";

import { resolveActiveOrganizationIdFromSession } from "./resolve-tenant";
import { getTenantContext, TenantScopeError } from "./tenant-scope";
import {
  applyTenantScope,
  type ScopedModel,
  TENANT_SCOPED_MODELS,
} from "./tenant-scope-guard";

export { TENANT_SCOPED_MODELS } from "./tenant-scope-guard";

export const tenantScopeExtension = Prisma.defineExtension((client) => {
  const guard = (model: ScopedModel) => ({
    $allOperations: async ({
      operation,
      args,
      query,
    }: {
      operation: string;
      args: unknown;
      query: (a: unknown) => Promise<unknown>;
    }) => {
      const ctx = getTenantContext();

      if (ctx?.kind === "admin") {
        return query(args);
      }

      const orgId =
        ctx?.kind === "tenant"
          ? ctx.organizationId
          : await resolveActiveOrganizationIdFromSession();

      if (!orgId) {
        throw new TenantScopeError(
          `${model}.${operation} requires tenant context. ` +
            `No active organization in the current session. ` +
            `Wrap system code in runAsAdmin() or caller in runInTenantScope().`,
        );
      }

      return query(applyTenantScope(model, operation, args, orgId));
    },
  });

  return client.$extends({
    name: "tenantScope",
    query: {
      task: guard("Task"),
      aiConversation: guard("AiConversation"),
      usageCounter: guard("UsageCounter"),
      activityEvent: guard("ActivityEvent"),
      agent: guard("Agent"),
      publicConversation: guard("PublicConversation"),
      lead: guard("Lead"),
      correction: guard("Correction"),
      knowledgeDocument: guard("KnowledgeDocument"),
      evalCase: guard("EvalCase"),
      evalRun: guard("EvalRun"),
    },
  });
});
