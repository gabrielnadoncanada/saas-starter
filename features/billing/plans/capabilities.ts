/**
 * All gated capabilities in the app.
 *
 * Convention: "feature.action" — keeps keys scannable and greppable.
 * To gate a new feature, add a key here, then add it to the relevant
 * plans in plans.ts. That's it.
 */
export const capabilities = [
  "task.create",
  "task.export",
  "team.invite",
  "team.analytics",
  "billing.portal",
  "api.access",
] as const;

export type Capability = (typeof capabilities)[number];
