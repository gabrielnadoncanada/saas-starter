import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/stripe/client", () => ({
  stripe: {},
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {},
}));

vi.mock("@/features/billing/server/sync-seat-quantity", () => ({
  syncSeatQuantity: vi.fn(),
}));

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_PRO_LIFETIME = "price_pro_lifetime";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

const { finalizeCheckoutSession } = await import(
  "@/features/billing/server/finalize-checkout"
);
const { syncSeatQuantity } = await import(
  "@/features/billing/server/sync-seat-quantity"
);

function mockDb(overrides: Record<string, any> = {}) {
  const tx = {
    $queryRaw: vi.fn().mockResolvedValue([]),
    processedStripeCheckout: {
      create: vi.fn().mockResolvedValue({}),
    },
    team: {
      findUnique: vi.fn().mockResolvedValue({
        stripeSubscriptionId: null,
        subscriptionStatus: null,
      }),
      update: vi.fn().mockResolvedValue({}),
      ...overrides.txTeam,
    },
  };

  return {
    $transaction: vi.fn(async (callback: any) => callback(tx)),
    processedStripeCheckout: tx.processedStripeCheckout,
    team: {
      findUnique: vi.fn().mockResolvedValue(null),
      ...overrides.team,
    },
    __tx: tx,
  } as any;
}

function mockStripe(overrides: Record<string, any> = {}) {
  return {
    subscriptions: {
      retrieve: vi.fn(),
      ...overrides.subscriptions,
    },
    checkout: {
      sessions: {
        retrieve: vi.fn(),
        listLineItems: vi.fn(),
        ...overrides.checkoutSessions,
      },
    },
  } as any;
}

describe("finalizeCheckoutSession", () => {
  it("sets lifetime status for one-time payments", async () => {
    const db = mockDb({
      team: {
        findUnique: vi.fn().mockResolvedValue({ id: 10 }),
      },
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_1" },
          metadata: { teamId: "10" },
          mode: "payment",
        }),
        listLineItems: vi.fn().mockResolvedValue({
          data: [
            {
              price: {
                id: "price_pro_lifetime",
                product: {
                  id: "prod_lt",
                  name: "Lifetime",
                  metadata: {},
                },
              },
            },
          ],
        }),
      },
    });

    await finalizeCheckoutSession("sess_1", { db, stripe });

    expect(db.__tx.team.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        planId: "pro",
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: null,
        stripeProductId: "prod_lt",
        subscriptionStatus: "lifetime",
        pricingModel: "one_time",
        pendingCheckoutPriceId: null,
        pendingCheckoutStartedAt: null,
      },
    });
  });

  it("sets subscription data for recurring payments", async () => {
    const db = mockDb({
      team: {
        findUnique: vi.fn().mockResolvedValue({ id: 20 }),
      },
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_2" },
          metadata: { teamId: "20" },
          mode: "subscription",
          subscription: "sub_abc",
        }),
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: "sub_abc",
          status: "trialing",
          items: {
            data: [
              {
                price: {
                  id: "price_pro_monthly",
                  product: {
                    id: "prod_pro",
                    name: "Pro",
                    metadata: {},
                  },
                },
              },
            ],
          },
        }),
      },
    });

    await finalizeCheckoutSession("sess_2", { db, stripe });

    expect(db.__tx.team.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        planId: "pro",
        stripeCustomerId: "cus_2",
        stripeSubscriptionId: "sub_abc",
        stripeProductId: "prod_pro",
        subscriptionStatus: "trialing",
        pricingModel: "flat",
      },
    });
    expect(syncSeatQuantity).not.toHaveBeenCalled();
  });

  it("syncs seat quantity after per-seat checkout finalization", async () => {
    const db = mockDb({
      team: {
        findUnique: vi.fn().mockResolvedValue({ id: 30 }),
      },
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_3" },
          metadata: { teamId: "30" },
          mode: "subscription",
          subscription: "sub_team",
        }),
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: "sub_team",
          status: "active",
          items: {
            data: [
              {
                price: {
                  id: "price_team_monthly",
                  product: {
                    id: "prod_team",
                    name: "Team",
                    metadata: {},
                  },
                },
              },
            ],
          },
        }),
      },
    });

    await finalizeCheckoutSession("sess_team", { db, stripe });

    expect(syncSeatQuantity).toHaveBeenCalledWith(30, { db, stripe });
  });

  it("returns early when the same checkout session was already processed", async () => {
    const db = mockDb({
      team: {
        findUnique: vi.fn().mockResolvedValue({ id: 40 }),
      },
    });
    vi.mocked(db.__tx.processedStripeCheckout.create).mockRejectedValue({
      code: "P2002",
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_4" },
          metadata: { teamId: "40" },
          mode: "subscription",
          subscription: "sub_dup",
        }),
      },
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: "sub_dup",
          status: "active",
          items: {
            data: [
              {
                price: {
                  id: "price_pro_monthly",
                  product: {
                    id: "prod_dup",
                    name: "Pro",
                    metadata: {},
                  },
                },
              },
            ],
          },
        }),
      },
    });

    await finalizeCheckoutSession("sess_dup", { db, stripe });

    expect(db.__tx.team.update).not.toHaveBeenCalled();
  });
});
