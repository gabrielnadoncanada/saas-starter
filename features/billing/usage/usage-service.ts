import { db } from "@/shared/lib/db/prisma";
import type { LimitKey } from "../plans";

/**
 * Records a usage event for a team.
 * Call this after the action succeeds (e.g. after creating a task).
 */
export async function recordUsage(teamId: number, limitKey: LimitKey) {
  await db.usageRecord.create({
    data: {
      teamId,
      limitKey,
    },
  });
}

/**
 * Counts usage for the current calendar month.
 * Use with checkLimit() or assertLimit() to enforce quotas.
 */
export async function getMonthlyUsage(
  teamId: number,
  limitKey: LimitKey,
): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return db.usageRecord.count({
    where: {
      teamId,
      limitKey,
      createdAt: { gte: startOfMonth },
    },
  });
}

/**
 * Counts total (non-periodic) usage.
 * Use for limits like teamMembers or storageMb that aren't time-bound.
 */
export async function getTotalUsage(
  teamId: number,
  limitKey: LimitKey,
): Promise<number> {
  return db.usageRecord.count({
    where: {
      teamId,
      limitKey,
    },
  });
}
