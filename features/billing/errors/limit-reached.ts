import type { LimitKey } from "../plans";

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
