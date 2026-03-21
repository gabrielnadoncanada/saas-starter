import { db } from "@/shared/lib/db/prisma";
import { LimitReachedError } from "../errors";
import type { LimitKey, PlanId } from "../plans";
import { getPlan } from "../plans";
import { getPlanLimit } from "../guards";

function getPeriodStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

type UsageDbClient = Pick<typeof db, "usageCounter">;

/**
 * Atomically reserves one unit of monthly usage.
 */
export async function consumeMonthlyUsage(
  organizationId: string,
  limitKey: LimitKey,
  planId: PlanId,
  deps: { db: UsageDbClient } = { db },
) {
  const periodStart = getPeriodStart();
  const limit = getPlanLimit(planId, limitKey);

  await deps.db.usageCounter.createMany({
    data: {
      organizationId,
      limitKey,
      periodStart,
      count: 0,
    },
    skipDuplicates: true,
  });

  const result = await deps.db.usageCounter.updateMany({
    where: {
      organizationId,
      limitKey,
      periodStart,
      count: {
        lt: limit,
      },
    },
    data: {
      count: {
        increment: 1,
      },
    },
  });

  if (result.count === 0) {
    const currentUsage = await getMonthlyUsage(organizationId, limitKey, deps);
    throw new LimitReachedError(
      limitKey,
      limit,
      currentUsage,
      getPlan(planId).name,
    );
  }
}

/**
 * Counts usage for the current calendar month.
 * Use with checkLimit() or assertLimit() to enforce quotas.
 */
export async function getMonthlyUsage(
  organizationId: string,
  limitKey: LimitKey,
  deps: { db: UsageDbClient } = { db },
): Promise<number> {
  const counter = await deps.db.usageCounter.findUnique({
    where: {
      organizationId_limitKey_periodStart: {
        organizationId,
        limitKey,
        periodStart: getPeriodStart(),
      },
    },
    select: {
      count: true,
    },
  });

  return counter?.count ?? 0;
}
