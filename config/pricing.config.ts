// HOW TO EDIT TENVIQ'S MARKETING PRICING (ONE-TIME PURCHASE)
// - Increment `seatsSold` as founding / early seats get purchased.
// - When foundingRemaining hits 0, the landing auto-promotes the Early tier as primary.
// - When earlyRemaining hits 0, Standard becomes primary.
// - Stripe payment links live in the env: NEXT_PUBLIC_STARTER_PURCHASE_URL_FOUNDING / _EARLY / _STANDARD.

export type StarterTierId = "founding" | "early" | "standard";

export type StarterTier = {
  id: StarterTierId;
  name: string;
  price: number;
  seatsCap: number | null;
  href: string;
};

const FOUNDING_CAP = 10;
const EARLY_CAP = 20;

const seatsSold = 8;

const priceUrlEnv = (key: string, fallback = "#pricing") =>
  process.env[key] ?? fallback;

export const starterTiers: Record<StarterTierId, StarterTier> = {
  founding: {
    id: "founding",
    name: "Founding",
    price: 99,
    seatsCap: FOUNDING_CAP,
    href: priceUrlEnv("NEXT_PUBLIC_STARTER_PURCHASE_URL_FOUNDING"),
  },
  early: {
    id: "early",
    name: "Early access",
    price: 149,
    seatsCap: EARLY_CAP,
    href: priceUrlEnv("NEXT_PUBLIC_STARTER_PURCHASE_URL_EARLY"),
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: 249,
    seatsCap: null,
    href: priceUrlEnv("NEXT_PUBLIC_STARTER_PURCHASE_URL_STANDARD"),
  },
};

export type StarterPricingStatus = {
  tiers: typeof starterTiers;
  founding: { sold: number; total: number; remaining: number; active: boolean };
  early: { sold: number; total: number; remaining: number; active: boolean };
  activeTier: StarterTier;
};

export function getStarterPricingStatus(): StarterPricingStatus {
  const foundingRemaining = Math.max(0, FOUNDING_CAP - seatsSold);
  const earlyRemaining = Math.max(
    0,
    EARLY_CAP - Math.max(seatsSold, FOUNDING_CAP),
  );

  const foundingActive = foundingRemaining > 0;
  const earlyActive = !foundingActive && earlyRemaining > 0;

  const activeTier = foundingActive
    ? starterTiers.founding
    : earlyActive
      ? starterTiers.early
      : starterTiers.standard;

  return {
    tiers: starterTiers,
    founding: {
      sold: Math.min(seatsSold, FOUNDING_CAP),
      total: FOUNDING_CAP,
      remaining: foundingRemaining,
      active: foundingActive,
    },
    early: {
      sold: Math.max(0, seatsSold - FOUNDING_CAP),
      total: EARLY_CAP - FOUNDING_CAP,
      remaining: earlyRemaining,
      active: earlyActive,
    },
    activeTier,
  };
}
