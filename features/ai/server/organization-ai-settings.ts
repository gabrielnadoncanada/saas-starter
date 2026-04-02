import "server-only";

import type { z } from "zod";

import { organizationAiSettingsSchema } from "@/features/ai/schemas/organization-ai-settings.schema";
import { AiModelSelectionError } from "@/features/ai/server/model-selection-error";
import type { OrganizationAiSettingsView } from "@/features/ai/types/ai.types";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import { assertCapability } from "@/features/billing/guards/plan-guards";
import {
  type AiModelId,
  defaultAiModelId,
  getAiModelOptions,
  getAllAiModelIds,
  isAiModelId,
} from "@/shared/lib/ai/models";
import { db } from "@/shared/lib/db/prisma";

type OrganizationAiSettingsInput = z.infer<typeof organizationAiSettingsSchema>;

function getDefaultOrganizationAiSettings() {
  const allowedModelIds = getAllAiModelIds();

  return {
    allowedModelIds,
    defaultModelId: defaultAiModelId,
  };
}

function assertKnownModelIds(modelIds: string[]): asserts modelIds is AiModelId[] {
  const unknownModelId = modelIds.find((modelId) => !isAiModelId(modelId));

  if (unknownModelId) {
    throw new AiModelSelectionError(
      "UNKNOWN_MODEL",
      `Unknown AI model: ${unknownModelId}`,
    );
  }
}

function toOrganizationAiSettingsView(record: {
  organizationId: string;
  allowedModelIds: string[];
  defaultModelId: string;
}): OrganizationAiSettingsView {
  assertKnownModelIds(record.allowedModelIds);

  if (!isAiModelId(record.defaultModelId)) {
    throw new AiModelSelectionError(
      "UNKNOWN_MODEL",
      `Unknown AI model: ${record.defaultModelId}`,
    );
  }

  return {
    organizationId: record.organizationId,
    allowedModelIds: record.allowedModelIds,
    defaultModelId: record.defaultModelId,
  };
}

function validateOrganizationAiSettings(input: OrganizationAiSettingsInput) {
  assertKnownModelIds(input.allowedModelIds);

  if (!isAiModelId(input.defaultModelId)) {
    throw new AiModelSelectionError(
      "UNKNOWN_MODEL",
      `Unknown AI model: ${input.defaultModelId}`,
    );
  }

  if (!input.allowedModelIds.includes(input.defaultModelId)) {
    throw new Error("The default AI model must be one of the allowed models.");
  }
}

export async function assertOrganizationAiAccess() {
  const organizationPlan = await getOrganizationPlan();

  if (!organizationPlan) {
    throw new Error("Organization not found");
  }

  assertCapability(organizationPlan.planId, "ai.assistant");
  return organizationPlan;
}

export async function getOrganizationAiSettings(organizationId: string) {
  const defaults = getDefaultOrganizationAiSettings();
  const record = await db.organizationAiSettings.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
      allowedModelIds: defaults.allowedModelIds,
      defaultModelId: defaults.defaultModelId,
    },
    select: {
      organizationId: true,
      allowedModelIds: true,
      defaultModelId: true,
    },
  });

  return toOrganizationAiSettingsView(record);
}

export async function updateOrganizationAiSettings(
  organizationId: string,
  input: OrganizationAiSettingsInput,
) {
  validateOrganizationAiSettings(input);

  const record = await db.organizationAiSettings.upsert({
    where: { organizationId },
    update: {
      allowedModelIds: input.allowedModelIds,
      defaultModelId: input.defaultModelId,
    },
    create: {
      organizationId,
      allowedModelIds: input.allowedModelIds,
      defaultModelId: input.defaultModelId,
    },
    select: {
      organizationId: true,
      allowedModelIds: true,
      defaultModelId: true,
    },
  });

  return toOrganizationAiSettingsView(record);
}

export async function listAllowedAiModelsForOrganization(organizationId: string) {
  const settings = await getOrganizationAiSettings(organizationId);
  return getAiModelOptions(settings.allowedModelIds);
}
