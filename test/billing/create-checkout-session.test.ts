import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/stripe/client", () => ({
  stripe: {},
}));

const { createCheckoutSession } = await import(
  "@/features/billing/server/create-checkout-session"
);

function mockStripe(overrides: Record<string, any> = {}) {
  return {
    prices: {
      retrieve: vi.fn(),
      ...overrides.prices,
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test" }),
        ...overrides.checkout,
      },
    },
  } as any;
}

describe("createCheckoutSession", () => {
  it("binds subscription checkout to the exact team and seat count", async () => {
    const stripe = mockStripe({
      prices: {
        retrieve: vi.fn().mockResolvedValue({
          id: "price_team",
          active: true,
          product: {
            id: "prod_team",
            active: true,
            metadata: { pricing_model: "per_seat" },
          },
        }),
      },
    });

    await createCheckoutSession(
      {
        priceId: "price_team",
        teamId: 42,
        seatQuantity: 5,
        stripeCustomerId: "cus_123",
        userEmail: "owner@example.com",
      },
      { stripe },
    );

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_123",
        line_items: [{ price: "price_team", quantity: 5 }],
        metadata: { teamId: "42" },
      }),
    );
  });

  it("uses payment mode for one-time products", async () => {
    const stripe = mockStripe({
      prices: {
        retrieve: vi.fn().mockResolvedValue({
          id: "price_lifetime",
          active: true,
          product: {
            id: "prod_lifetime",
            active: true,
            metadata: { pricing_model: "one_time" },
          },
        }),
      },
    });

    await createCheckoutSession(
      {
        priceId: "price_lifetime",
        teamId: 7,
        seatQuantity: 99,
        stripeCustomerId: null,
        userEmail: "buyer@example.com",
      },
      { stripe },
    );

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_email: "buyer@example.com",
        line_items: [{ price: "price_lifetime", quantity: 1 }],
        metadata: { teamId: "7" },
      }),
    );
  });
});
