import { describe, expect, it } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

const { billingConfig } = await import("@/config/billing.config");
const { findCatalogPrice, getPlan, getPlanDisplayPrice } =
  await import("@/features/billing/plans");

describe("billing catalog price mapping", () => {
  it("keeps Stripe prices in the recurring catalog", () => {
    expect(getPlanDisplayPrice("pro", "month")?.priceId).toBe(
      "price_pro_monthly",
    );
    expect(getPlanDisplayPrice("pro", "year")?.priceId).toBe(
      "price_pro_yearly",
    );
    expect(getPlanDisplayPrice("team", "month")?.priceId).toBe(
      "price_team_monthly",
    );
    expect(getPlanDisplayPrice("team", "year")?.priceId).toBe(
      "price_team_yearly",
    );
    expect(getPlan("free").intervalPricing).toEqual({});
    expect(
      billingConfig.plans.find((plan) => plan.id === "pro")?.highlighted,
    ).toBe(true);
  });

  it("resolves Stripe recurring price ids back to catalog entries", () => {
    expect(
      findCatalogPrice("price_pro_monthly"),
    ).toMatchObject({
      billingInterval: "month",
      itemKey: "pro",
      itemType: "plan",
    });
    expect(
      findCatalogPrice("price_team_yearly"),
    ).toMatchObject({
      billingInterval: "year",
      itemKey: "team",
      itemType: "plan",
    });
  });

  it("rejects unknown price ids", () => {
    expect(findCatalogPrice("price_unknown")).toBeNull();
  });
});
