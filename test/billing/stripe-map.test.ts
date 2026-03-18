import { describe, it, expect } from "vitest";

import {
  resolvePlanFromStripeName,
  resolvePlanFromStripeProduct,
} from "@/features/billing/plans/stripe-map";
import { resolvePricingModel } from "@/features/billing/plans/pricing-model";

describe("resolvePlanFromStripeName", () => {
  it("maps known Stripe product names to plan IDs", () => {
    expect(resolvePlanFromStripeName("Base")).toBe("pro");
    expect(resolvePlanFromStripeName("Pro")).toBe("pro");
    expect(resolvePlanFromStripeName("Plus")).toBe("team");
    expect(resolvePlanFromStripeName("Team")).toBe("team");
  });

  it("falls back to free for unknown names", () => {
    expect(resolvePlanFromStripeName("Enterprise")).toBe("free");
    expect(resolvePlanFromStripeName("")).toBe("free");
  });

  it("falls back to free for null/undefined", () => {
    expect(resolvePlanFromStripeName(null)).toBe("free");
    expect(resolvePlanFromStripeName(undefined)).toBe("free");
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(resolvePlanFromStripeName(" pro ")).toBe("pro");
    expect(resolvePlanFromStripeName("TEAM")).toBe("team");
  });
});

describe("resolvePlanFromStripeProduct", () => {
  it("prefers stable metadata plan IDs", () => {
    expect(
      resolvePlanFromStripeProduct({
        name: "Totally Custom Name",
        metadata: { plan_id: "team" },
      }),
    ).toBe("team");
  });
});

describe("resolvePricingModel", () => {
  it("resolves valid pricing models from metadata", () => {
    expect(resolvePricingModel({ pricing_model: "flat" })).toBe("flat");
    expect(resolvePricingModel({ pricing_model: "per_seat" })).toBe("per_seat");
    expect(resolvePricingModel({ pricing_model: "one_time" })).toBe("one_time");
  });

  it("defaults to flat for missing metadata", () => {
    expect(resolvePricingModel(null)).toBe("flat");
    expect(resolvePricingModel(undefined)).toBe("flat");
    expect(resolvePricingModel({})).toBe("flat");
  });

  it("defaults to flat for invalid values", () => {
    expect(resolvePricingModel({ pricing_model: "monthly" })).toBe("flat");
    expect(resolvePricingModel({ pricing_model: "" })).toBe("flat");
  });
});
