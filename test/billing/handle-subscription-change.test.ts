import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("@/shared/lib/stripe/client", () => ({
  stripe: {},
}));

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {},
}));

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_PRO_LIFETIME = "price_pro_lifetime";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

const { handleSubscriptionChange } = await import(
  "@/features/billing/server/handle-subscription-change"
);

function mockDb(overrides: Record<string, any> = {}) {
  return {
    team: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
      ...overrides.team,
    },
  } as any;
}

function mockStripe(overrides: Record<string, any> = {}) {
  return {
    products: {
      retrieve: vi.fn().mockResolvedValue({
        id: "prod_1",
        name: "Pro",
        metadata: { plan_id: "pro", pricing_model: "flat" },
      }),
      ...overrides.products,
    },
  } as any;
}

describe("handleSubscriptionChange", () => {
  it("updates team plan when subscription becomes active", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          planId: null,
          pricingModel: "flat",
          stripeProductId: "prod_old",
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
        data: [{ price: { id: "price_pro_monthly", product: "prod_1" } }],
      },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        planId: "pro",
        stripeSubscriptionId: "sub_1",
        stripeProductId: "prod_1",
        subscriptionStatus: "active",
        pricingModel: "flat",
      },
    });
  });

  it("clears plan data when subscription reaches a terminal status", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          planId: "pro",
          pricingModel: "flat",
          stripeProductId: "prod_1",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    });

    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "canceled",
      items: { data: [] },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe: mockStripe() });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        planId: null,
        stripeSubscriptionId: null,
        stripeProductId: null,
        subscriptionStatus: "canceled",
        pricingModel: null,
      },
    });
  });

  it("keeps subscription linkage for recoverable payment states", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 9,
          planId: "pro",
          pricingModel: "flat",
          stripeProductId: "prod_existing",
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    });
    const stripe = mockStripe();

    const subscription = {
      id: "sub_9",
      customer: "cus_9",
      status: "past_due",
      items: {
        data: [{ price: { id: "price_pro_monthly", product: "prod_1" } }],
      },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe });

    expect(db.team.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: {
        planId: "pro",
        stripeSubscriptionId: "sub_9",
        stripeProductId: "prod_1",
        subscriptionStatus: "past_due",
        pricingModel: "flat",
      },
    });
  });

  it("skips update for one-time pricing model teams", async () => {
    const db = mockDb({
      team: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          planId: "pro",
          pricingModel: "one_time",
          stripeProductId: "prod_lt",
        }),
        update: vi.fn(),
      },
    });

    const subscription = {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      items: { data: [{ price: { id: "price_pro_monthly", product: "prod_1" } }] },
    } as unknown as Stripe.Subscription;

    await handleSubscriptionChange(subscription, { db, stripe: mockStripe() });

    expect(db.team.update).not.toHaveBeenCalled();
  });
});
