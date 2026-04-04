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
              access by plan, reserve credits before each request, reuse the
              same guarded task contract, and keep the provider choice explicit.
              The inbox and invoice flows stay honest scaffolds until you wire
              real product data behind them.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "AI assistant - gated to Pro and Team plans",
                "Included credits + top-ups - prepaid AI monetization",
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
                // Route-level AI gating + credit reservation
              </p>
              <pre className="whitespace-pre leading-relaxed">
                {`const entitlements = await assertOrganizationAiAccess();
const reservedCredits = getCreditReserve(strategy);

const assistantModel = getAssistantModel();
await reserveCredits({
  organizationId: entitlements.organizationId,
  credits: reservedCredits,
  referenceId,
});

const result = streamText({
  model: assistantModel.model,
  tools: assistantTools,
  onFinish: ({ usage }) =>
    settleReservedCredits({
      organizationId: entitlements.organizationId,
      reservedCredits,
      finalCredits: calculateCreditCharge({ strategy, usage }),
      referenceId,
    }),
});`}
              </pre>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm font-mono text-gray-100">
              <p className="mb-1 text-xs text-gray-500">
                // Tool-level billing stays real too
              </p>
              <pre className="whitespace-pre leading-relaxed">
                {`const entitlements = await getCurrentOrganizationEntitlements();
assertCapability(entitlements, "email.sync");

const messages = await emailProvider.getRecentMessages();
await consumeMonthlyUsage(
  entitlements.organizationId,
  "emailSyncsPerMonth",
  entitlements,
);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
