import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  capabilities: z
    .string()
    .trim()
    .min(1, "Select at least one capability")
    .transform((value) =>
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string()).min(1, "Select at least one capability")),
});

export const revokeApiKeySchema = z.object({
  apiKeyId: z.string().trim().min(1, "API key is required"),
});

export type CreateApiKeyValues = z.infer<typeof createApiKeySchema>;
export type RevokeApiKeyValues = z.infer<typeof revokeApiKeySchema>;
