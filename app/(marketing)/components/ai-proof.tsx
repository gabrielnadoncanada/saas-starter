export function AiProof() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              AI-ready monetization from day one
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most AI starters show model calls. This one shows how to{" "}
              <strong>gate, meter, and sell them</strong>.
            </p>
            <p className="mt-3 text-muted-foreground">
              The included assistant demonstrates a billing-aware AI module:
              access by plan, enforce monthly usage limits, reuse the same
              guarded task contract, and keep the provider choice explicit. The
              inbox and invoice flows stay honest scaffolds until you wire real
              product data behind them.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "AI assistant - gated to Pro and Team plans",
                "aiRequestsPerMonth - usage-limited like any other quota",
                "Task creation - real guarded business action",
                "Demo inbox scaffold - included for email-to-task patterns",
                "Invoice draft scaffold - included for structured AI workflows",
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
            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100">
              <p className="mb-1 text-xs text-gray-500">
                // Route-level AI gating + provider resolution
              </p>
              <pre className="whitespace-pre leading-relaxed">
{`const organizationPlan = await getOrganizationPlan();
assertCapability(organizationPlan.planId, "ai.assistant");

const usage = await getMonthlyUsage(
  organizationPlan.organizationId,
  "aiRequestsPerMonth"
);
assertLimit(organizationPlan.planId, "aiRequestsPerMonth", usage);

const assistantModel = getAssistantModel();

const result = streamText({
  model: assistantModel.model,
  tools: assistantTools,
  onFinish: () =>
    recordUsage(organizationPlan.organizationId, "aiRequestsPerMonth"),
});`}
              </pre>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100">
              <p className="mb-1 text-xs text-gray-500">
                // Tool-level billing stays real too
              </p>
              <pre className="whitespace-pre leading-relaxed">
{`assertCapability(organizationPlan.planId, "email.sync");

const usage = await getMonthlyUsage(
  organizationPlan.organizationId,
  "emailSyncsPerMonth"
);
assertLimit(organizationPlan.planId, "emailSyncsPerMonth", usage);

const messages = await emailProvider.getRecentMessages();
await recordUsage(organizationPlan.organizationId, "emailSyncsPerMonth");`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

