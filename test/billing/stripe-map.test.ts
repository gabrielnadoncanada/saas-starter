import { describe, expect, it } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";

const { plans } = await import("@/shared/config/billing.config");

const { isConfiguredStripePriceId } = await import(
  "@/features/billing/server/recurring-selection"
);

describe("billing config prices", () => {
  it("keeps Stripe prices in the billing config", () => {
    expect(plans.pro.prices.monthly?.priceId).toBe("price_pro_monthly");
    expect(plans.pro.prices.yearly?.priceId).toBe("price_pro_yearly");
    expect(plans.team.prices.monthly?.priceId).toBe("price_team_monthly");
  });

  it("recognises configured Stripe price ids", () => {
    expect(isConfiguredStripePriceId("price_pro_monthly")).toBe(true);
    expect(isConfiguredStripePriceId("price_pro_yearly")).toBe(true);
    expect(isConfiguredStripePriceId("price_team_monthly")).toBe(true);
  });

  it("rejects unknown or missing price ids", () => {
    expect(isConfiguredStripePriceId("price_unknown")).toBe(false);
    expect(isConfiguredStripePriceId("")).toBe(false);
    expect(isConfiguredStripePriceId(null)).toBe(false);
    expect(isConfiguredStripePriceId(undefined)).toBe(false);
  });
});
