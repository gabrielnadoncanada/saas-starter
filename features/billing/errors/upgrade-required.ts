import type { Capability } from "../plans";

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
