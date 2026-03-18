/**
 * All usage limits in the app.
 *
 * To add a new limit: add a key here, set its value in each plan
 * in plans.ts, then guard it with assertLimit() or checkLimit().
 *
 * Enforced:  tasksPerMonth, teamMembers, aiRequestsPerMonth, emailSyncsPerMonth
 * Placeholder (wire up when you build the feature): storageMb
 */
export const limitKeys = [
  "tasksPerMonth",
  "teamMembers",
  "storageMb", // placeholder — enforce when you add file uploads
  "aiRequestsPerMonth",
  "emailSyncsPerMonth",
] as const;

export type LimitKey = (typeof limitKeys)[number];
