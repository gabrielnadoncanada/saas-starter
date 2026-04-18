import "server-only";

import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

export async function listEvalCases(agentId: string) {
  await requireActiveOrganizationMembership();
  return db.evalCase.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listEvalRuns(agentId: string, take = 20) {
  await requireActiveOrganizationMembership();
  return db.evalRun.findMany({
    where: { agentId },
    orderBy: { startedAt: "desc" },
    take,
    include: {
      agentVersion: { select: { id: true, version: true } },
      _count: { select: { results: true } },
    },
  });
}

export async function getEvalRun(runId: string) {
  await requireActiveOrganizationMembership();
  return db.evalRun.findFirst({
    where: { id: runId },
    include: {
      agentVersion: { select: { id: true, version: true } },
      results: {
        include: {
          case: {
            select: {
              id: true,
              name: true,
              input: true,
              expectedOutput: true,
              criteria: true,
              tags: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
