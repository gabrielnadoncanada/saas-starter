// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href }, children),
}));

import { DashboardCurrentPlanCard } from "@/features/dashboard/components/dashboard-current-plan-card";

describe("DashboardCurrentPlanCard", () => {
  it("shows trial status and trial end date when the subscription is trialing", () => {
    render(
      React.createElement(DashboardCurrentPlanCard, {
        billingInterval: null,
        cancelAtPeriodEnd: false,
        periodEnd: null,
        planId: "pro",
        planName: "Pro",
        subscriptionStatus: "trialing",
        trialEnd: "2026-04-17T00:00:00.000Z",
      }),
    );

    expect(screen.getByText("Trial")).toBeTruthy();
    expect(screen.getByText("Trial ends on Apr 17, 2026")).toBeTruthy();
  });
});
