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
              with a limit check. Subscriptions, seats, and one-time products
              resolve into one entitlement object. Stripe decides what is active.
              Your catalog decides what it gives.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "assertCapability() — gate features by entitlements",
                "assertLimit() — enforce usage quotas",
                "consumeMonthlyUsage() — meter AI and tasks against monthly quotas",
                "Billing catalog — one source of truth for plans and line items",
                "Three billing models — flat subscription, per-seat subscription, one-time",
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
                assertLimit(entitlements, "teamMembers", memberCount); // If we
                get here, the user's plan allows it
              </pre>
            </div>

            {/* Code example 2: plan config */}
            <div className="rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100 overflow-x-auto">
              <p className="mb-1 text-xs text-gray-500">
                // Simplified shape — real config: shared/config/billing.config.ts
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

        <div className="mt-16 border-t pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-orange-500">
              Verifiable in the source
            </p>
            <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Three claims you can grep for
            </h3>
            <p className="mt-3 text-muted-foreground">
              Marketing pages promise anything. These three guarantees live in
              specific files, and you can check them in under a minute.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-lg border bg-card p-5 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
                Claim 1
              </p>
              <h4 className="mt-2 text-base font-semibold text-foreground">
                Monthly usage metering is concurrency-safe
              </h4>
              <p className="mt-2 text-muted-foreground">
                Two parallel requests can never both slip past the quota.
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  consumeMonthlyUsage
                </code>
                uses a conditional
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  updateMany
                </code>
                with
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  count: {"{ lte: limit - amount }"}
                </code>
                so the database itself enforces the check and increment in a
                single atomic write.
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                features/billing/server/usage-service.ts
              </p>
            </article>

            <article className="rounded-lg border bg-card p-5 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
                Claim 2
              </p>
              <h4 className="mt-2 text-base font-semibold text-foreground">
                The AI assistant respects billing, not the other way around
              </h4>
              <p className="mt-2 text-muted-foreground">
                Every assistant request runs through
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  assertCapability(entitlements, "ai.assistant")
                </code>
                before a single token streams. Free-plan orgs get a 403 at the
                server, not a client-side toast, and the same entitlement object
                gates every tool call.
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                features/assistant/server/organization-ai-access.ts
              </p>
            </article>

            <article className="rounded-lg border bg-card p-5 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
                Claim 3
              </p>
              <h4 className="mt-2 text-base font-semibold text-foreground">
                Seat limits count pending invitations
              </h4>
              <p className="mt-2 text-muted-foreground">
                A 5-seat plan can't invite 20 people by firing invites in
                parallel. The invite action counts{" "}
                <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  members + pending invitations
                </code>
                and asserts against the limit before hitting Better Auth —
                a detail most starters miss.
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                features/organizations/actions/membership.actions.ts
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
