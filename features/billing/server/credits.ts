import "server-only";

import { db } from "@/shared/lib/db/prisma";

import { InsufficientCreditsError } from "../errors/billing-errors";

type CreditBalanceSummary = {
  purchased: number;
  subscription: number;
  total: number;
};

type CreditDbClient = Pick<typeof db, "creditGrant" | "creditLedgerEntry">;
type CreditTransactionClient = typeof db;

function getActiveGrantWhere(organizationId: string) {
  return {
    organizationId,
    creditsRemaining: { gt: 0 },
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

export async function getCreditBalance(
  organizationId: string,
  deps: { db: CreditDbClient } = { db },
): Promise<CreditBalanceSummary> {
  const grants = await deps.db.creditGrant.findMany({
    where: getActiveGrantWhere(organizationId),
    select: {
      creditsRemaining: true,
      sourceType: true,
    },
  });

  return grants.reduce<CreditBalanceSummary>(
    (summary, grant) => {
      if (grant.sourceType === "subscription_cycle") {
        summary.subscription += grant.creditsRemaining;
      } else {
        summary.purchased += grant.creditsRemaining;
      }

      summary.total += grant.creditsRemaining;
      return summary;
    },
    { purchased: 0, subscription: 0, total: 0 },
  );
}

export async function assertCreditsAvailable(
  organizationId: string,
  requiredCredits: number,
  deps: { db: CreditDbClient } = { db },
) {
  const balance = await getCreditBalance(organizationId, deps);

  if (balance.total < requiredCredits) {
    throw new InsufficientCreditsError(balance.total, requiredCredits);
  }
}

export async function grantCredits(
  input: {
    organizationId: string;
    sourceKey: string;
    sourceType: "credit_pack" | "manual_adjustment" | "subscription_cycle";
    creditsGranted: number;
    expiresAt?: Date | null;
    reason: string;
    referenceId?: string;
    referenceType?: string;
  },
  deps: { db: CreditTransactionClient } = { db },
) {
  const existingGrant = await deps.db.creditGrant.findUnique({
    where: {
      organizationId_sourceType_sourceKey: {
        organizationId: input.organizationId,
        sourceKey: input.sourceKey,
        sourceType: input.sourceType,
      },
    },
  });

  if (existingGrant) {
    return existingGrant;
  }

  const grant = await deps.db.creditGrant.create({
    data: {
      organizationId: input.organizationId,
      sourceType: input.sourceType,
      sourceKey: input.sourceKey,
      creditsGranted: input.creditsGranted,
      creditsRemaining: input.creditsGranted,
      expiresAt: input.expiresAt ?? null,
    },
  });

  await deps.db.creditLedgerEntry.create({
    data: {
      organizationId: input.organizationId,
      grantId: grant.id,
      delta: input.creditsGranted,
      reason: input.reason,
      referenceId: input.referenceId ?? null,
      referenceType: input.referenceType ?? null,
    },
  });

  return grant;
}

export async function consumeCredits(input: {
  organizationId: string;
  credits: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
}) {
  if (input.credits <= 0) {
    return;
  }

  await db.$transaction(async (tx) => {
    const balance = await getCreditBalance(input.organizationId, { db: tx });

    if (balance.total < input.credits) {
      throw new InsufficientCreditsError(balance.total, input.credits);
    }

    const grants = await tx.creditGrant.findMany({
      where: getActiveGrantWhere(input.organizationId),
      orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
      select: { id: true, creditsRemaining: true },
    });

    let remaining = input.credits;

    for (const grant of grants) {
      if (remaining <= 0) {
        break;
      }

      const debit = Math.min(grant.creditsRemaining, remaining);
      remaining -= debit;

      await tx.creditGrant.update({
        where: { id: grant.id },
        data: { creditsRemaining: { decrement: debit } },
      });

      await tx.creditLedgerEntry.create({
        data: {
          organizationId: input.organizationId,
          grantId: grant.id,
          delta: -debit,
          reason: input.reason,
          referenceId: input.referenceId ?? null,
          referenceType: input.referenceType ?? null,
        },
      });
    }
  });
}

export async function reserveCredits(input: {
  organizationId: string;
  credits: number;
  referenceId: string;
}) {
  await consumeCredits({
    organizationId: input.organizationId,
    credits: input.credits,
    reason: "credit_reservation",
    referenceId: input.referenceId,
    referenceType: "assistant_request",
  });
}

export async function settleReservedCredits(input: {
  organizationId: string;
  reservedCredits: number;
  finalCredits: number;
  referenceId: string;
}) {
  if (input.finalCredits > input.reservedCredits) {
    await consumeCredits({
      organizationId: input.organizationId,
      credits: input.finalCredits - input.reservedCredits,
      reason: "credit_charge_settlement",
      referenceId: input.referenceId,
      referenceType: "assistant_request",
    });
    return;
  }

  if (input.finalCredits < input.reservedCredits) {
    await grantCredits({
      organizationId: input.organizationId,
      sourceType: "manual_adjustment",
      sourceKey: `refund:${input.referenceId}`,
      creditsGranted: input.reservedCredits - input.finalCredits,
      reason: "credit_reservation_refund",
      referenceId: input.referenceId,
      referenceType: "assistant_request",
    });
  }
}

export async function listCreditActivity(organizationId: string, limit = 10) {
  return db.creditLedgerEntry.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      createdAt: true,
      delta: true,
      reason: true,
      referenceId: true,
      referenceType: true,
    },
  });
}
