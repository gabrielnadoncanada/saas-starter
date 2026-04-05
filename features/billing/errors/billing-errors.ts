import type { Capability, LimitKey } from "@/shared/config/billing.config";

export class LimitReachedError extends Error {
  public readonly limitKey: LimitKey;
  public readonly limit: number;
  public readonly currentUsage: number;
  public readonly currentPlan: string;

  constructor(
    limitKey: LimitKey,
    limit: number,
    currentUsage: number,
    currentPlan: string,
  ) {
    super(
      `Limit reached for "${limitKey}": ${currentUsage}/${limit} (plan: ${currentPlan})`,
    );
    this.name = "LimitReachedError";
    this.limitKey = limitKey;
    this.limit = limit;
    this.currentUsage = currentUsage;
    this.currentPlan = currentPlan;
  }
}

export class UpgradeRequiredError extends Error {
  public readonly capability: Capability;
  public readonly currentPlan: string;

  constructor(capability: Capability, currentPlan: string) {
    super(
      `Upgrade required to use "${capability}" (current plan: ${currentPlan})`,
    );
    this.name = "UpgradeRequiredError";
    this.capability = capability;
    this.currentPlan = currentPlan;
  }
}

