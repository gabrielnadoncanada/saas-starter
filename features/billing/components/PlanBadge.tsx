import type { PlanId } from "../plans";

type PlanBadgeProps = {
  plan: PlanId;
};

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-500/20">
      {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
    </span>
  );
}
