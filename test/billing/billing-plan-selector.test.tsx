// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/billing/actions/checkout.actions", () => ({
  startSubscriptionCheckoutAction: vi.fn(),
}));

vi.mock("@/features/billing/actions/customer-portal.actions", () => ({
  openBillingPortalAction: vi.fn(),
}));

vi.mock(
  "@/features/billing/actions/subscription-configuration.actions",
  () => ({
    changePlanAction: vi.fn(),
  }),
);

import { BillingPlanSelector } from "@/features/billing/components/billing-plan-selector";

const plans = [
  {
    id: "pro" as const,
    name: "Pro",
    description: "For shipping.",
    features: ["Feature A"],
    monthly: {
      priceId: "price_pro_month",
      unitAmount: 2900,
      currency: "usd" as const,
    },
    yearly: null,
  },
  {
    id: "team" as const,
    name: "Team",
    description: "For teams.",
    features: ["Analytics"],
    monthly: {
      priceId: "price_team_month",
      unitAmount: 4900,
      currency: "usd" as const,
    },
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

        hasCurrentSubscription: true,
        plans,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Proceed to payment" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "This organization already has an active subscription. The Stripe portal is not available until the Stripe customer is synced.",
      ),
    ).toBeTruthy();
  });
});
