import { Prisma } from "@prisma/client";

import {
  applyTenantScope,
  type ScopedModel,
  TENANT_SCOPED_MODELS,
} from "./tenant-scope-guard";

export { TENANT_SCOPED_MODELS } from "./tenant-scope-guard";

export const tenantScopeExtension = Prisma.defineExtension((client) => {
  const guard = (model: ScopedModel) => ({
    $allOperations: ({
      operation,
      args,
      query,
    }: {
      operation: string;
      args: unknown;
      query: (a: unknown) => Promise<unknown>;
    }) => {
      return query(applyTenantScope(model, operation, args));
    },
  });

  return client.$extends({
    name: "tenantScope",
    query: {
      task: guard("Task"),
      aiConversation: guard("AiConversation"),
      usageCounter: guard("UsageCounter"),
      activityEvent: guard("ActivityEvent"),
    },
  });
});
