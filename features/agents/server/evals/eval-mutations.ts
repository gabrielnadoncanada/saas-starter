import "server-only";

import type {
  CreateEvalCaseValues,
  UpdateEvalCaseValues,
} from "@/features/agents/schemas/eval.schema";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db/prisma";

export async function createEvalCase(data: CreateEvalCaseValues) {
  const membership = await requireActiveOrganizationMembership();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return db.evalCase.create({
    data: {
      organizationId: membership.organizationId,
      agentId: data.agentId,
      name: data.name,
      input: data.input,
      expectedOutput: data.expectedOutput ?? null,
      criteria: data.criteria ?? null,
      tags: data.tags,
      createdByUserId: user.id,
    },
  });
}

export async function updateEvalCase(data: UpdateEvalCaseValues) {
  await requireActiveOrganizationMembership();
  const { caseId, ...rest } = data;
  await db.evalCase.updateMany({
    where: { id: caseId },
    data: rest,
  });
}

export async function deleteEvalCase(caseId: string) {
  await requireActiveOrganizationMembership();
  await db.evalCase.deleteMany({ where: { id: caseId } });
}
