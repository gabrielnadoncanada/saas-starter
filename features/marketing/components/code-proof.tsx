export function CodeProof() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Plan gating that actually works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most starters connect Stripe and leave you to build the
              enforcement layer yourself. This starter ships it.
            </p>
            <p className="mt-3 text-muted-foreground">
              Gate any feature with a capability check. Enforce any usage quota
              with a limit check. Credits, add-ons, and seats resolve into one
              entitlement object. Stripe decides what is active. Your catalog
              decides what it gives.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "assertCapability() - gate features by entitlements",
                "assertLimit() — enforce usage quotas",
                "consumeCredits() - bill AI usage with prepaid balance",
                "Billing catalog - one source of truth for plans and add-ons",
                "Four billing models - one-time, subscription, seats, add-ons",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  <span className="font-mono">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-4 lg:mt-0">
            {/* Code example 1: gating a feature */}
            <div className="rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100 overflow-x-auto">
              <p className="mb-1 text-xs text-gray-500">
                // Gate a feature in your server action
              </p>
              <pre className="whitespace-pre leading-relaxed">
                const entitlements = await getCurrentOrganizationEntitlements();

assertCapability(entitlements, "team.invite");
assertLimit(entitlements, "teamMembers", memberCount);

// If we get here, the user's plan allows it
              </pre>
            </div>

            {/* Code example 2: plan config */}
            <div className="rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100 overflow-x-auto">
              <p className="mb-1 text-xs text-gray-500">
                // plans.ts — single source of truth
              </p>
              <pre className="whitespace-pre leading-relaxed">
                {`export const plans = {
  free: {
    capabilities: ["task.create", "billing.portal"],
    limits: { tasksPerMonth: 10, teamMembers: 1 },
  },
  pro: {
    capabilities: ["task.create", "task.export",
                    "team.invite", "billing.portal"],
    limits: { tasksPerMonth: 1000, teamMembers: 5 },
  },
};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
