import { describe, expect, it } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_PRO_LIFETIME = "price_pro_lifetime";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

const {
  plans,
} = await import("@/features/billing/config/billing.config");

const {
  getConfiguredStripePriceIds,
  resolvePlanFromStripePriceId,
  resolvePricingModelFromStripePriceId,
} = await import("@/features/billing/server/billing-resolver");

describe("configured Stripe price resolution", () => {
  it("keeps Stripe prices in the billing config", () => {
    expect(plans.pro.prices.monthly?.priceId).toBe("price_pro_monthly");
    expect(plans.team.prices.monthly?.priceId).toBe("price_team_monthly");
  });

  it("exposes configured Stripe price ids from the billing config", () => {
    expect(getConfiguredStripePriceIds()).toEqual([
      "price_pro_monthly",
      "price_pro_yearly",
      "price_pro_lifetime",
      "price_team_monthly",
      "price_team_yearly",
    ]);
  });

  it("maps configured Stripe price ids to internal plan ids", () => {
    expect(resolvePlanFromStripePriceId("price_pro_monthly")).toBe("pro");
    expect(resolvePlanFromStripePriceId("price_pro_yearly")).toBe("pro");
    expect(resolvePlanFromStripePriceId("price_pro_lifetime")).toBe("pro");
    expect(resolvePlanFromStripePriceId("price_team_monthly")).toBe("team");
    expect(resolvePlanFromStripePriceId("price_team_yearly")).toBe("team");
  });

  it("falls back to free for unknown or missing price ids", () => {
    expect(resolvePlanFromStripePriceId("price_unknown")).toBe("free");
    expect(resolvePlanFromStripePriceId("")).toBe("free");
    expect(resolvePlanFromStripePriceId(null)).toBe("free");
    expect(resolvePlanFromStripePriceId(undefined)).toBe("free");
  });

  it("resolves pricing model from configured Stripe price ids", () => {
    expect(resolvePricingModelFromStripePriceId("price_pro_monthly")).toBe("flat");
    expect(resolvePricingModelFromStripePriceId("price_pro_yearly")).toBe("flat");
    expect(resolvePricingModelFromStripePriceId("price_pro_lifetime")).toBe("one_time");
    expect(resolvePricingModelFromStripePriceId("price_team_monthly")).toBe("per_seat");
    expect(resolvePricingModelFromStripePriceId("price_team_yearly")).toBe("per_seat");
  });

  it("defaults pricing model to flat for unknown price ids", () => {
    expect(resolvePricingModelFromStripePriceId("price_unknown")).toBe("flat");
    expect(resolvePricingModelFromStripePriceId(null)).toBe("flat");
  });
});
