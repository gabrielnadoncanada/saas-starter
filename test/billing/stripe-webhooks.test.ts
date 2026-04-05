import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    purchase: {
      upsert: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    subscriptionItem: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/features/billing/server/stripe/stripe-customers", () => ({
  clearStripeCustomerBillingState: vi.fn(),
  findOrganizationIdByStripeCustomerId: vi.fn(),
  syncOrganizationStripeCustomer: vi.fn(),
}));

const { db } = await import("@/shared/lib/db/prisma");
const {
  clearStripeCustomerBillingState,
  findOrganizationIdByStripeCustomerId,
  syncOrganizationStripeCustomer,
} = await import("@/features/billing/server/stripe/stripe-customers");
const { handleStripeWebhookEvent } =
  await import("@/features/billing/server/stripe/stripe-webhooks");

function createSubscriptionEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_subscription",
    type: "customer.subscription.created",
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        metadata: {},
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        cancel_at: null,
        canceled_at: null,
        ended_at: null,
        schedule: null,
        items: {
          data: [
            {
              id: "si_plan",
              quantity: 3,
              current_period_start: 1_710_000_000,
              current_period_end: 1_712_592_000,
              price: {
                id: "price_pro_monthly",
                recurring: {
                  interval: "month",
                },
              },
            },
          ],
        },
        ...overrides,
      },
    },
  };
}

describe("handleStripeWebhookEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(db.subscription.findFirst).mockResolvedValue(null as never);
    vi.mocked(db.subscription.upsert).mockResolvedValue({
      id: "sub_123",
    } as never);
    vi.mocked(db.subscriptionItem.upsert).mockResolvedValue({
      id: "item_123",
    } as never);
    vi.mocked(db.subscriptionItem.updateMany).mockResolvedValue({
      count: 0,
    } as never);
    vi.mocked(db.purchase.upsert).mockResolvedValue({
      id: "purchase_123",
    } as never);
    vi.mocked(findOrganizationIdByStripeCustomerId).mockResolvedValue(
      "org_123",
    );
    vi.mocked(syncOrganizationStripeCustomer).mockResolvedValue(undefined);
    vi.mocked(clearStripeCustomerBillingState).mockResolvedValue({
      clearedOrganizations: 1,
      deletedSubscriptions: 1,
    });
  });

  it("syncs the Stripe customer and records one-time purchases when checkout completes", async () => {
    await handleStripeWebhookEvent({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          mode: "payment",
          customer: "cus_123",
          amount_total: 7900,
          currency: "usd",
          metadata: {
            checkoutType: "one_time_product",
            itemKey: "storage_boost",
            organizationId: "org_123",
          },
          client_reference_id: null,
          payment_intent: "pi_123",
        },
      },
    } as never);

    expect(syncOrganizationStripeCustomer).toHaveBeenCalledWith({
      organizationId: "org_123",
      customerId: "cus_123",
    });
    expect(db.purchase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          organizationId: "org_123",
          purchaseType: "one_time_product",
          itemKey: "storage_boost",
        }),
      }),
    );
  });

  it("syncs subscriptions from recurring price ids and mirrors subscription items", async () => {
    await handleStripeWebhookEvent(createSubscriptionEvent() as never);

    expect(syncOrganizationStripeCustomer).toHaveBeenCalledWith({
      organizationId: "org_123",
      customerId: "cus_123",
    });
    expect(db.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          plan: "pro",
          referenceId: "org_123",
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
          billingInterval: "month",
          seats: 3,
        }),
      }),
    );
    expect(db.subscriptionItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          itemKey: "pro",
          itemType: "plan",
          quantity: 3,
        }),
      }),
    );
  });

  it("falls back to metadata.planId when the Stripe price id is unknown", async () => {
    await handleStripeWebhookEvent(
      createSubscriptionEvent({
        metadata: { planId: "team", organizationId: "org_456" },
        customer: "cus_456",
        items: {
          data: [
            {
              id: "si_unknown",
              quantity: 8,
              current_period_start: 1_710_000_000,
              current_period_end: 1_712_592_000,
              price: {
                id: "price_unknown",
                recurring: { interval: "year" },
              },
            },
          ],
        },
      }) as never,
    );

    expect(syncOrganizationStripeCustomer).toHaveBeenCalledWith({
      organizationId: "org_456",
      customerId: "cus_456",
    });
    expect(db.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          plan: "team",
          referenceId: "org_456",
          billingInterval: "year",
        }),
      }),
    );
  });

  it("clears billing state when a Stripe customer is deleted", async () => {
    await handleStripeWebhookEvent({
      id: "evt_customer_deleted",
      type: "customer.deleted",
      data: {
        object: {
          id: "cus_123",
        },
      },
    } as never);

    expect(clearStripeCustomerBillingState).toHaveBeenCalledWith("cus_123");
  });

  it("keeps unrelated billing events as safe no-ops", async () => {
    await handleStripeWebhookEvent({
      id: "evt_invoice_failed",
      type: "invoice.payment_failed",
      data: { object: {} },
    } as never);

    expect(db.subscription.upsert).not.toHaveBeenCalled();
    expect(db.purchase.upsert).not.toHaveBeenCalled();
  });
});
