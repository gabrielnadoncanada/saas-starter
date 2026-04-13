import { z } from "zod";

import {
  getPlanDisplayPrice,
  isBillingInterval,
  isPlanId,
} from "@/features/billing/plans";
import type { BillingInterval, PlanId } from "@/shared/config/billing.config";

const paidPlanIdSchema = z
  .string()
  .refine(
    (value) => isPlanId(value) && value !== "free",
    "Invalid billing selection.",
  )
  .transform((value) => value as Exclude<PlanId, "free">);

const billingIntervalSchema = z
  .string()
  .refine(isBillingInterval, "Invalid billing selection.")
  .transform((value) => value as BillingInterval);

export const subscriptionCheckoutSchema = z
  .object({
    planId: paidPlanIdSchema,
    billingInterval: billingIntervalSchema,
  })
  .refine(
    ({ planId, billingInterval }) =>
      Boolean(getPlanDisplayPrice(planId, billingInterval)),
    {
      message: "Invalid billing selection.",
      path: ["planId"],
    },
  );
