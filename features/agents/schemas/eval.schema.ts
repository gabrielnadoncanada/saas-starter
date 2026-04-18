import { z } from "zod";

export const createEvalCaseSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(255),
  input: z.string().trim().min(1, "Input is required").max(10_000),
  expectedOutput: z.string().trim().max(20_000).optional(),
  criteria: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});

export const updateEvalCaseSchema = z.object({
  caseId: z.string().min(1),
  name: z.string().trim().min(1).max(255).optional(),
  input: z.string().trim().min(1).max(10_000).optional(),
  expectedOutput: z.string().trim().max(20_000).optional(),
  criteria: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  enabled: z.boolean().optional(),
});

export const deleteEvalCaseSchema = z.object({
  caseId: z.string().min(1),
});

export const runEvalSchema = z.object({
  agentId: z.string().min(1),
  agentVersionId: z.string().min(1).optional(),
});

export type CreateEvalCaseValues = z.infer<typeof createEvalCaseSchema>;
export type UpdateEvalCaseValues = z.infer<typeof updateEvalCaseSchema>;
export type RunEvalValues = z.infer<typeof runEvalSchema>;
