import type { Capability } from "./capabilities";
import type { LimitKey } from "./limits";

export type PlanId = "free" | "pro" | "team";

export type Plan = {
  id: PlanId;
  name: string;
  capabilities: Capability[];
  limits: Record<LimitKey, number>;
};

/**
 * Single source of truth for what each plan includes.
 *
 * Stripe decides *which* plan is active.
 * This file decides *what that plan gives you*.
 */
export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    capabilities: ["task.create", "billing.portal"],
    limits: {
      tasksPerMonth: 10,
      teamMembers: 1,
      storageMb: 100,
      aiRequestsPerMonth: 0,
      emailSyncsPerMonth: 0,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    capabilities: [
      "task.create",
      "task.export",
      "team.invite",
      "billing.portal",
      "api.access",
      "ai.assistant",
      "email.sync",
      "invoice.create",
    ],
    limits: {
      tasksPerMonth: 1000,
      teamMembers: 5,
      storageMb: 5000,
      aiRequestsPerMonth: 100,
      emailSyncsPerMonth: 50,
    },
  },

  team: {
    id: "team",
    name: "Team",
    capabilities: [
      "task.create",
      "task.export",
      "team.invite",
      "team.analytics",
      "billing.portal",
      "api.access",
      "ai.assistant",
      "email.sync",
      "invoice.create",
    ],
    limits: {
      tasksPerMonth: 10000,
      teamMembers: 50,
      storageMb: 50000,
      aiRequestsPerMonth: 500,
      emailSyncsPerMonth: 200,
    },
  },
};

export function getPlan(planId: PlanId): Plan {
  return plans[planId];
}

export function isPlanId(value: string): value is PlanId {
  return value in plans;
}
