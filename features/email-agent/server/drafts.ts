import "server-only";

import { db } from "@/lib/db/prisma";

export async function listPendingDrafts() {
  return db.agentDraft.findMany({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      thread: { select: { id: true, subject: true, participants: true } },
      emailAccount: { select: { email: true } },
    },
  });
}

export async function rejectDraft(draftId: string): Promise<void> {
  const draft = await db.agentDraft.findFirst({
    where: { id: draftId },
    select: { id: true, threadId: true },
  });
  if (!draft) throw new Error("Draft not found.");
  await db.$transaction(async (tx) => {
    await tx.agentDraft.update({
      where: { id: draft.id },
      data: { status: "REJECTED" },
    });
    await tx.emailThread.update({
      where: { id: draft.threadId },
      data: { hasPendingDraft: false },
    });
  });
}

export async function updateDraftBody(input: {
  draftId: string;
  bodyText: string;
}): Promise<void> {
  await db.agentDraft.update({
    where: { id: input.draftId },
    data: { bodyText: input.bodyText },
  });
}
