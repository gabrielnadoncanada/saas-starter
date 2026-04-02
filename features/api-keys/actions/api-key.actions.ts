"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/features/audit/server/record-audit-log";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import { assertCapability } from "@/features/billing/guards/plan-guards";
import {
  createOrganizationApiKey,
  revokeOrganizationApiKey,
} from "@/features/api-keys/server/api-key-service";
import {
  createApiKeySchema,
  revokeApiKeySchema,
} from "@/features/api-keys/schemas/api-key.schema";
import { createNotification } from "@/features/notifications/server/notification-service";
import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";
import { routes } from "@/shared/constants/routes";

export const createApiKeyAction = validatedOrganizationOwnerAction<
  typeof createApiKeySchema,
  { secret?: string }
>(createApiKeySchema, async ({ name, capabilities }, _, context) => {
  const organizationPlan = await getOrganizationPlan();

  if (!organizationPlan) {
    return { error: "Unable to determine organization plan" };
  }

  try {
    assertCapability(organizationPlan.planId, "api.access");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "API access is unavailable",
    };
  }

  const { apiKey, secret } = await createOrganizationApiKey({
    organizationId: context.organizationId,
    createdByUserId: context.user.id,
    name,
    capabilities,
  });

  await Promise.all([
    recordAuditLog({
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      event: "api_key.created",
      entityType: "api_key",
      entityId: apiKey.id,
      summary: `Created API key "${apiKey.name}"`,
      metadata: {
        capabilities: apiKey.capabilities,
        prefix: apiKey.prefix,
      },
    }),
    createNotification({
      organizationId: context.organizationId,
      userId: context.user.id,
      type: "api_key.created",
      title: "API key created",
      body: `The key "${apiKey.name}" is ready to use. Store the secret now.`,
      href: routes.settings.apiKeys,
      metadata: { apiKeyId: apiKey.id },
    }),
  ]);

  revalidatePath(routes.settings.apiKeys);

  return {
    success: "API key created",
    secret,
  };
});

export const revokeApiKeyAction = validatedOrganizationOwnerAction<
  typeof revokeApiKeySchema,
  {}
>(revokeApiKeySchema, async ({ apiKeyId }, _, context) => {
  const result = await revokeOrganizationApiKey(context.organizationId, apiKeyId);

  if (result.count === 0) {
    return { error: "API key not found" };
  }

  await Promise.all([
    recordAuditLog({
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      event: "api_key.revoked",
      entityType: "api_key",
      entityId: apiKeyId,
      summary: "Revoked an API key",
    }),
    createNotification({
      organizationId: context.organizationId,
      userId: context.user.id,
      type: "api_key.revoked",
      title: "API key revoked",
      body: "An API key was revoked for this workspace.",
      href: routes.settings.apiKeys,
      metadata: { apiKeyId },
    }),
  ]);

  revalidatePath(routes.settings.apiKeys);

  return { success: "API key revoked" };
});
