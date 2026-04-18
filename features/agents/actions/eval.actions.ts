"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createEvalCaseSchema,
  deleteEvalCaseSchema,
  runEvalSchema,
  updateEvalCaseSchema,
} from "@/features/agents/schemas/eval.schema";
import {
  createEvalCase,
  deleteEvalCase,
  updateEvalCase,
} from "@/features/agents/server/evals/eval-mutations";
import { runEval } from "@/features/agents/server/evals/eval-runner";

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  return parsed.data;
}

export async function createEvalCaseAction(
  input: z.input<typeof createEvalCaseSchema>,
) {
  const data = parse(createEvalCaseSchema, input);
  const result = await createEvalCase(data);
  revalidatePath(`/agents/${data.agentId}`);
  return { id: result.id };
}

export async function updateEvalCaseAction(
  input: z.input<typeof updateEvalCaseSchema>,
) {
  const data = parse(updateEvalCaseSchema, input);
  await updateEvalCase(data);
  revalidatePath(`/agents`);
}

export async function deleteEvalCaseAction(
  input: z.input<typeof deleteEvalCaseSchema>,
) {
  const { caseId } = parse(deleteEvalCaseSchema, input);
  await deleteEvalCase(caseId);
  revalidatePath(`/agents`);
}

export async function runEvalAction(input: z.input<typeof runEvalSchema>) {
  const data = parse(runEvalSchema, input);
  const result = await runEval(data);
  revalidatePath(`/agents/${data.agentId}`);
  return result;
}
