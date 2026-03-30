import { describe, expect, it } from "vitest";

process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";

const { billingConfig, findPlanPriceByPriceId, getPlan, getPlanPrice } = await import(
  "@/shared/config/billing.config"
);

describe("billing config prices", () => {
  it("keeps Stripe prices in the billing config", () => {
    expect(getPlanPrice("pro", "month")?.priceId).toBe("price_pro_monthly");
    expect(getPlanPrice("pro", "year")?.priceId).toBe("price_pro_yearly");
    expect(getPlanPrice("team", "month")?.priceId).toBe("price_team_monthly");
    expect(getPlanPrice("team", "year")?.priceId).toBe("price_team_yearly");
    expect(getPlan("free").prices).toEqual({});
    expect(billingConfig.plans.find((plan) => plan.id === "pro")?.highlighted).toBe(
      true,
    );
  });

  it("can resolve Stripe price ids back to the billing config", () => {
    expect(findPlanPriceByPriceId("price_pro_monthly")?.plan.id).toBe("pro");
    expect(findPlanPriceByPriceId("price_pro_yearly")?.billingInterval).toBe("year");
    expect(findPlanPriceByPriceId("price_team_monthly")?.plan.id).toBe("team");
    expect(findPlanPriceByPriceId("price_team_yearly")?.billingInterval).toBe("year");
  });

  it("rejects unknown or missing price ids", () => {
    expect(findPlanPriceByPriceId("price_unknown")).toBeNull();
  });
});
