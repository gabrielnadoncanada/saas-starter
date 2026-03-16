import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";

// Mock the Stripe client module before any imports that depend on it
vi.mock("@/shared/lib/stripe/client", () => ({
  stripe: {},
}));

// Mock the Prisma client module
vi.mock("@/shared/lib/db/prisma", () => ({
  db: {},
}));

const { handleSubscriptionChange } = await import(
  "@/features/billing/server/handle-subscription-change"
);
const { finalizeCheckoutSession } = await import(
  "@/features/billing/server/finalize-checkout"
);

// ---------------------------------------------------------------------------
// Shared mock helpers
// ---------------------------------------------------------------------------

function mockDb(overrides: Record<string, any> = {}) {
  return {
    team: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
      ...overrides.team,
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      ...overrides.user,
    },
    teamMember: {
      findFirst: vi.fn().mockResolvedValue(null),
      ...overrides.teamMember,
    },
  } as any;
}

function mockStripe(overrides: Record<string, any> = {}) {
  return {
    products: {
      retrieve: vi.fn().mockResolvedValue({ id: "prod_1", name: "Pro" }),
      ...overrides.products,
    },
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

// ---------------------------------------------------------------------------
// handleSubscriptionChange
// ---------------------------------------------------------------------------

describe("handleSubscriptionChange", () => {
  it("updates team plan when subscription becomes active", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          pricingModel: "flat",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    });
    const stripe = mockStripe();

    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      items: {
        data: [{ plan: { product: "prod_1" } }],
      },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        stripeSubscriptionId: "sub_1",
        stripeProductId: "prod_1",
        planName: "Pro",
        subscriptionStatus: "active",
      },
    });
  });

  it("clears plan data when subscription is canceled", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          pricingModel: "flat",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    });
    const stripe = mockStripe();

    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "canceled",
      items: { data: [] },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        stripeSubscriptionId: null,
        stripeProductId: null,
        planName: null,
        subscriptionStatus: "canceled",
      },
    });
  });

  it("skips update for one-time pricing model teams", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          pricingModel: "one_time",
        }),
        update: vi.fn(),
      },
    });
    const stripe = mockStripe();

    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      items: { data: [{ plan: { product: "prod_1" } }] },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).not.toHaveBeenCalled();
  });

  it("does nothing when team is not found", async () => {
    const db = mockDb();
    const stripe = mockStripe();

    const subscription = {
      id: "sub_1",
      customer: "cus_unknown",
      status: "active",
      items: { data: [] },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// finalizeCheckoutSession
// ---------------------------------------------------------------------------

describe("finalizeCheckoutSession", () => {
  it("sets lifetime status for one-time payments", async () => {
    const db = mockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 1 }),
      },
      teamMember: {
        findFirst: vi.fn().mockResolvedValue({ teamId: 10 }),
      },
      team: {
        update: vi.fn().mockResolvedValue({}),
      },
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_1" },
          client_reference_id: "1",
          mode: "payment",
        }),
        listLineItems: vi.fn().mockResolvedValue({
          data: [
            {
              price: {
                product: { id: "prod_lt", name: "Lifetime" },
              },
            },
          ],
        }),
      },
    });

    await finalizeCheckoutSession("sess_1", { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: null,
        stripeProductId: "prod_lt",
        planName: "Lifetime",
        subscriptionStatus: "lifetime",
        pricingModel: "one_time",
      },
    });
  });

  it("sets subscription data for recurring payments", async () => {
    const db = mockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 2 }),
      },
      teamMember: {
        findFirst: vi.fn().mockResolvedValue({ teamId: 20 }),
      },
      team: {
        update: vi.fn().mockResolvedValue({}),
      },
    });
    const stripe = mockStripe({
      checkoutSessions: {
        retrieve: vi.fn().mockResolvedValue({
          customer: { id: "cus_2" },
          client_reference_id: "2",
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
                  product: {
                    id: "prod_pro",
                    name: "Pro",
                    metadata: { pricing_model: "flat" },
                  },
                },
              },
            ],
          },
        }),
      },
    });

    await finalizeCheckoutSession("sess_2", { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: {
        stripeCustomerId: "cus_2",
        stripeSubscriptionId: "sub_abc",
        stripeProductId: "prod_pro",
        planName: "Pro",
        subscriptionStatus: "trialing",
        pricingModel: "flat",
      },
    });
  });
});
