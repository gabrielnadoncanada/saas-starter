import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/db/prisma", () => ({
  db: {
    subscription: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    organization: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
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
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(db.subscription.findFirst).mockResolvedValue(null);
    vi.mocked(db.subscription.upsert).mockResolvedValue({
      id: "sub_123",
    } as never);
    vi.mocked(db.organization.updateMany).mockResolvedValue({
      count: 1,
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

  it("syncs the Stripe customer when checkout completes", async () => {
    await handleStripeWebhookEvent({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_123",
          customer: "cus_123",
          metadata: { organizationId: "org_123" },
          client_reference_id: null,
        },
      },
    } as never);

    expect(syncOrganizationStripeCustomer).toHaveBeenCalledWith({
      organizationId: "org_123",
      customerId: "cus_123",
    });
  });

  it("syncs subscriptions from the Stripe price id mapping", async () => {
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
  });

  it("falls back to metadata.planId when the Stripe price id is unknown", async () => {
    await handleStripeWebhookEvent(
      createSubscriptionEvent({
        metadata: { planId: "team", organizationId: "org_456" },
        customer: "cus_456",
        items: {
          data: [
            {
              quantity: 8,
              current_period_start: 1_710_000_000,
              current_period_end: 1_712_592_000,
              price: {
                id: "price_unknown",
                recurring: {
                  interval: "year",
                },
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

  it("keeps informational billing events as safe no-ops", async () => {
    await handleStripeWebhookEvent({
      id: "evt_invoice_failed",
      type: "invoice.payment_failed",
      data: { object: {} },
    } as never);
    await handleStripeWebhookEvent({
      id: "evt_trial_end",
      type: "customer.subscription.trial_will_end",
      data: { object: {} },
    } as never);

    expect(db.subscription.upsert).not.toHaveBeenCalled();
    expect(clearStripeCustomerBillingState).not.toHaveBeenCalled();
  });
});
