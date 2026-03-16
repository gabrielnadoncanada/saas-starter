/**
 * All usage limits in the app.
 *
 * To add a new limit: add a key here, set its value in each plan
 * in plans.ts, then guard it with assertLimit() or checkLimit().
 */
export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb",
] as const;

export type LimitKey = (typeof limitKeys)[number];
