import type { BillingPrice, PlanId } from "@/config/billing.config";

export type PricingPlanView = {
  id: PlanId;
  name: string;
  description: string | null;
  features: string[];
  highlighted: boolean;
  monthly: BillingPrice | null;
  yearly: BillingPrice | null;
};
