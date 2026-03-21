import { describe, expect, it } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";

const { resolveRecurringSelectionFromPriceId } = await import(
  "@/features/billing/server/recurring-selection"
);

describe("resolveRecurringSelectionFromPriceId", () => {
  it("maps recurring Stripe prices to Better Auth upgrade params", () => {
    expect(resolveRecurringSelectionFromPriceId("price_pro_monthly")).toEqual({
      planId: "pro",
      pricingModel: "flat",
    });

    expect(resolveRecurringSelectionFromPriceId("price_team_monthly")).toEqual({
      planId: "team",
      pricingModel: "per_seat",
    });
  });

  it("rejects unknown Stripe prices", () => {
    expect(resolveRecurringSelectionFromPriceId("price_unknown")).toBeNull();
  });
});
