"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createCorrection,
  deleteCorrection,
  toggleCorrectionExample,
} from "@/features/agents/server/correction-mutations";

const createSchema = z.object({
  conversationId: z.string().min(1),
  messageId: z.string().min(1).max(120),
  correctedMessage: z.string().trim().min(1).max(10_000),
  useAsExample: z.boolean().default(true),
});

export async function createCorrectionAction(input: z.input<typeof createSchema>) {
  const data = createSchema.parse(input);
  const result = await createCorrection(data);
  revalidatePath("/agents");
  return { id: result.id };
}

export async function deleteCorrectionAction(input: { correctionId: string }) {
  await deleteCorrection(input.correctionId);
  revalidatePath("/agents");
}

export async function toggleCorrectionExampleAction(input: {
  correctionId: string;
  useAsExample: boolean;
}) {
  await toggleCorrectionExample(input.correctionId, input.useAsExample);
  revalidatePath("/agents");
}
