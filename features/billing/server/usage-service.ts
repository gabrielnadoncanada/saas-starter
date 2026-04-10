import {
  type LimitKey,
  type OrganizationEntitlements,
} from "@/shared/config/billing.config";
import { db } from "@/shared/lib/db/prisma";

import { getPlanLimit, LimitReachedError } from "@/features/billing/plans";

function getPeriodStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

type UsageDbClient = Pick<typeof db, "usageCounter">;

/**
 * Atomically reserves one unit of monthly usage.
 */
export async function consumeMonthlyUsage(params: {
  organizationId: string;
  limitKey: LimitKey;
  entitlements: OrganizationEntitlements;
  amount?: number;
  db?: UsageDbClient;
}) {
  const amount = params.amount ?? 1;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Usage amount must be a positive number.");
  }

  const periodStart = getPeriodStart();
  const limit = getPlanLimit(params.entitlements, params.limitKey);
  const usageDb = params.db ?? db;

  await usageDb.usageCounter.createMany({
    data: {
      organizationId: params.organizationId,
      limitKey: params.limitKey,
      periodStart,
      count: 0,
    },
    skipDuplicates: true,
  });

  const result = await usageDb.usageCounter.updateMany({
    where: {
      organizationId: params.organizationId,
      limitKey: params.limitKey,
      periodStart,
      count: {
        lte: limit - amount,
      },
    },
    data: {
      count: {
        increment: amount,
      },
    },
  });

  if (result.count === 0) {
    const currentUsage = await getMonthlyUsage(
      params.organizationId,
      params.limitKey,
      { db: usageDb },
    );
    throw new LimitReachedError(
      params.limitKey,
      limit,
      currentUsage,
      params.entitlements.planName,
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
