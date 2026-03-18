import type { Prisma } from "@prisma/client";

import { isTerminalStripeSubscriptionStatus } from "@/features/billing/plans";
import { db as defaultDb } from "@/shared/lib/db/prisma";

const CHECKOUT_LOCK_WINDOW_MS = 30 * 60 * 1000;

type CheckoutLockDeps = {
  db: Pick<typeof defaultDb, "$transaction">;
};

export class CheckoutInProgressError extends Error {
  constructor() {
    super("A checkout is already in progress for this team.");
  }
}

type LockedTeam = {
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  pendingCheckoutStartedAt: Date | null;
};

function hasFreshPendingCheckout(team: LockedTeam) {
  if (!team.pendingCheckoutStartedAt) {
    return false;
  }

  return (
    Date.now() - team.pendingCheckoutStartedAt.getTime() <
    CHECKOUT_LOCK_WINDOW_MS
  );
}

function assertCheckoutAvailable(team: LockedTeam) {
  if (
    team.stripeSubscriptionId &&
    !isTerminalStripeSubscriptionStatus(team.subscriptionStatus)
  ) {
    throw new CheckoutInProgressError();
  }

  if (hasFreshPendingCheckout(team)) {
    throw new CheckoutInProgressError();
  }
}

export async function reserveCheckoutForTeam(
  teamId: number,
  priceId: string,
  deps: CheckoutLockDeps = { db: defaultDb },
) {
  await deps.db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${teamId} FOR UPDATE`;

    const team = await tx.team.findUnique({
      where: { id: teamId },
      select: {
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        pendingCheckoutStartedAt: true,
      },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    assertCheckoutAvailable(team);

    await tx.team.update({
      where: { id: teamId },
      data: {
        pendingCheckoutPriceId: priceId,
        pendingCheckoutStartedAt: new Date(),
      },
    });
  });
}

export async function releaseCheckoutForTeam(
  teamId: number,
  tx: Prisma.TransactionClient,
) {
  await tx.team.update({
    where: { id: teamId },
    data: {
      pendingCheckoutPriceId: null,
      pendingCheckoutStartedAt: null,
    },
  });
}

export async function clearCheckoutReservation(
  teamId: number,
  deps: CheckoutLockDeps = { db: defaultDb },
) {
  await deps.db.$transaction(async (tx) => {
    await releaseCheckoutForTeam(teamId, tx);
  });
}
