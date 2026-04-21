"use client";

import posthog from "posthog-js";

let initialized = false;

// PostHog is optional: when NEXT_PUBLIC_POSTHOG_KEY is unset or we're in SSR,
// every export becomes a no-op so callers don't need to guard themselves.
function isPostHogEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function initPostHog() {
  if (initialized || !isPostHogEnabled()) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
    loaded: (p) => {
      if (process.env.NODE_ENV === "development") p.debug();
    },
  });
  initialized = true;
}

export function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  if (!isPostHogEnabled()) return;
  posthog.capture(name, properties);
}

export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>,
) {
  if (!isPostHogEnabled()) return;
  posthog.identify(userId, traits);
}

export function resetPostHog() {
  if (!isPostHogEnabled()) return;
  posthog.reset();
}
