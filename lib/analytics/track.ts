"use client";

/**
 * Vendor-neutral tracking facade. Swap the implementation inside
 * `posthog-client.ts` (or replace this re-export with a different
 * provider) without touching component imports.
 */
export { trackEvent, identifyUser } from "@/lib/analytics/posthog-client";
