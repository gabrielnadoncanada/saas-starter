/**
 * All gated capabilities in the app.
 *
 * Convention: "feature.action" — keeps keys scannable and greppable.
 * To gate a new feature, add a key here, then add it to the relevant
 * plans in plans.ts, then guard it with assertCapability().
 *
 * Enforced:  task.create, team.invite, team.analytics, billing.portal
 * Placeholder (wire up when you build the feature): task.export, api.access
 */
export const capabilities = [
  "task.create",
  "task.export", // placeholder — enforce when you add CSV/PDF export
  "team.invite",
  "team.analytics",
  "billing.portal",
  "api.access", // placeholder — enforce in your API middleware
] as const;

export type Capability = (typeof capabilities)[number];
