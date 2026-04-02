import { z } from "zod";

function parseAllowedModelIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const organizationAiSettingsSchema = z
  .object({
    allowedModelIds: z.string().min(1, "Select at least one model."),
    defaultModelId: z.string().min(1, "Select a default model."),
  })
  .transform(({ allowedModelIds, defaultModelId }) => ({
    allowedModelIds: parseAllowedModelIds(allowedModelIds),
    defaultModelId,
  }));
