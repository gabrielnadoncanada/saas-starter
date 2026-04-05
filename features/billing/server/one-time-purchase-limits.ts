import type { LimitKey } from "@/shared/config/billing.config";

/** Matches `billingConfig.oneTimeProducts` id for the storage add-on. */
const STORAGE_BOOST_PRODUCT_ID = "storage_boost";
/** Same increment as the product marketing copy (+10 GB). */
const STORAGE_BOOST_EXTRA_MB = 10_000;

export function applyOneTimePurchaseLimits(
  limits: Record<LimitKey, number>,
  purchasedItemKeys: string[],
): Record<LimitKey, number> {
  if (!purchasedItemKeys.includes(STORAGE_BOOST_PRODUCT_ID)) {
    return limits;
  }

  return {
    ...limits,
    storageMb: limits.storageMb + STORAGE_BOOST_EXTRA_MB,
  };
}
