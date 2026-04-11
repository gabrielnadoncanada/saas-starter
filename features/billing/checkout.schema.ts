import { z } from "zod";

import {
  getOneTimeProduct,
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
    seatQuantity: z
      .string()
      .optional()
      .transform((value) => {
        const seatQuantity = Number(value);

        return Number.isFinite(seatQuantity) ? Math.max(1, seatQuantity) : null;
      }),
  })
  .refine(
    ({ planId, billingInterval }) =>
      Boolean(getPlanDisplayPrice(planId, billingInterval)),
    {
      message: "Invalid billing selection.",
      path: ["planId"],
    },
  );

export const oneTimeCheckoutSchema = z.object({
  itemKey: z
    .string()
    .refine(
      (value) => Boolean(getOneTimeProduct(value)?.price),
      "The selected purchase is not configured.",
    ),
  itemType: z.literal("one_time_product"),
});
