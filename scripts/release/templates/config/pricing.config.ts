// This file is only used by the marketing landing page. For the real
// subscription plans enforced in the app (capabilities, limits, Stripe
// price IDs), see `config/billing.config.ts`.
//
// The starter ships with the marketing landing reading plans directly from
// `app/(marketing)/page.tsx`. If you want to centralize pricing for your
// own marketing surface, extend this file.

export type StarterTierId = "free" | "pro" | "team";

export type StarterTier = {
  id: StarterTierId;
  name: string;
  price: number;
};

export const starterTiers: Record<StarterTierId, StarterTier> = {
  free: { id: "free", name: "Free", price: 0 },
  pro: { id: "pro", name: "Pro", price: 29 },
  team: { id: "team", name: "Team", price: 99 },
};
