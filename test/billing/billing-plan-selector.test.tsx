// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/billing/actions/checkout.actions", () => ({
  startSubscriptionCheckoutAction: vi.fn(),
}));

vi.mock("@/features/billing/actions/customer-portal.actions", () => ({
  customerPortalAction: vi.fn(),
}));

vi.mock(
  "@/features/billing/actions/subscription-configuration.actions",
  () => ({
    updateSubscriptionConfigurationAction: vi.fn(),
  }),
);

vi.mock("@/features/billing/components/billing-plan-selector-fields", () => ({
  BillingIntervalSelector: () => React.createElement("div", null, "Interval"),
  BillingPlanRadioGroup: () => React.createElement("div", null, "Plans"),
}));

import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";

const plans = [
  {
    id: "pro" as const,
    name: "Pro",
    description: "For shipping.",
    features: ["Feature A"],
    pricingModel: "flat" as const,
    monthly: { unitAmount: 2900 },
    yearly: null,
  },
  {
    id: "team" as const,
    name: "Team",
    description: "For teams.",
    features: ["Seats"],
    pricingModel: "per_seat" as const,
    monthly: { unitAmount: 4900 },
    yearly: null,
  },
];

describe("BillingPlanSelector", () => {
  it("shows the translated owner-only label", () => {
    render(
      React.createElement(BillingPlanSelector, {
        canManageBilling: false,
        canManagePortal: false,
        canUpdateSubscription: false,
        currentBillingInterval: "month",
        currentPlanId: "pro",
        currentSeatQuantity: 1,
        hasCurrentSubscription: false,
        plans,
      }),
    );

    expect(
      screen
        .getByRole("button", { name: "Only the owner can manage billing" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("shows update and portal actions for an active subscription", () => {
    render(
      React.createElement(BillingPlanSelector, {
        canManageBilling: true,
        canManagePortal: true,
        canUpdateSubscription: true,
        currentBillingInterval: "month",
        currentPlanId: "pro",
        currentSeatQuantity: 1,
        hasCurrentSubscription: true,
        plans,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Update subscription" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Open billing portal" }),
    ).toBeTruthy();
  });

  it("shows the already-active help when the subscription cannot be updated yet", () => {
    render(
      React.createElement(BillingPlanSelector, {
        canManageBilling: true,
        canManagePortal: false,
        canUpdateSubscription: false,
        currentBillingInterval: "month",
        currentPlanId: "pro",
        currentSeatQuantity: 1,
        hasCurrentSubscription: true,
        plans,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Proceed to payment" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "This workspace already has an active subscription. The Stripe portal is not available until the Stripe customer is synced.",
      ),
    ).toBeTruthy();
  });
});
