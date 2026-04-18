import { z } from "zod";

import { type AgentToolName,ALL_AGENT_TOOL_NAMES } from "@/features/agents/types";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only");

const nameSchema = z.string().trim().min(1, "Name is required").max(120);
const descriptionSchema = z.string().trim().max(2000).optional();
const systemPromptSchema = z.string().trim().min(1, "System prompt is required").max(20_000);
const welcomeMessageSchema = z.string().trim().max(1000).optional();
const localeSchema = z.string().trim().min(2).max(5);
const modelIdSchema = z.string().trim().min(1).max(80);

const agentToolNameSchema = z.enum(ALL_AGENT_TOOL_NAMES as [AgentToolName, ...AgentToolName[]]);

export const qualificationFieldSchema = z.object({
  key: z.string().trim().min(1).max(60).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "number", "email", "phone", "select", "multiselect", "boolean"]),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1)).optional(),
  description: z.string().trim().max(500).optional(),
});

export const qualificationSchemaSchema = z.object({
  fields: z.array(qualificationFieldSchema).default([]),
});

export const createAgentSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  description: descriptionSchema,
  locale: localeSchema.default("en"),
  modelId: modelIdSchema.default("gemini-2.5-flash"),
  systemPrompt: systemPromptSchema,
  welcomeMessage: welcomeMessageSchema,
  toolsEnabled: z.array(agentToolNameSchema).default([]),
  qualificationSchema: qualificationSchemaSchema.optional(),
});

export const updateAgentSchema = createAgentSchema
  .partial()
  .extend({ agentId: z.string().min(1) });

export const deleteAgentSchema = z.object({
  agentId: z.string().min(1),
});

export const createAgentVersionSchema = z.object({
  agentId: z.string().min(1),
  systemPrompt: systemPromptSchema,
  notes: z.string().trim().max(2000).optional(),
  activate: z.boolean().default(false),
});

export const activateAgentVersionSchema = z.object({
  agentId: z.string().min(1),
  versionId: z.string().min(1),
});

export type CreateAgentValues = z.infer<typeof createAgentSchema>;
export type UpdateAgentValues = z.infer<typeof updateAgentSchema>;
export type CreateAgentVersionValues = z.infer<typeof createAgentVersionSchema>;
export type ActivateAgentVersionValues = z.infer<typeof activateAgentVersionSchema>;
export type QualificationSchema = z.infer<typeof qualificationSchemaSchema>;
export type QualificationField = z.infer<typeof qualificationFieldSchema>;
