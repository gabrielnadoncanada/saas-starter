import { Check, Minus, X } from "lucide-react";

type ComparisonRow = {
  feature: string;
  thisStarter: "yes" | "no" | "partial";
  freeBoilerplate: "yes" | "no" | "partial";
  heavierStarter: "yes" | "no" | "partial";
  buildFromScratch: "yes" | "no" | "partial";
};

const rows: ComparisonRow[] = [
  {
    feature: "Auth (OAuth + magic link)",
    thisStarter: "yes",
    freeBoilerplate: "partial",
    heavierStarter: "yes",
    buildFromScratch: "no",
  },
  {
    feature: "Stripe checkout + webhooks",
    thisStarter: "yes",
    freeBoilerplate: "partial",
    heavierStarter: "yes",
    buildFromScratch: "no",
  },
  {
    feature: "Enforced plan gating",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "no",
    buildFromScratch: "no",
  },
  {
    feature: "Usage limits + quotas",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "no",
    buildFromScratch: "no",
  },
  {
    feature: "Three billing models (flat, per-seat, one-time)",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "partial",
    buildFromScratch: "no",
  },
  {
    feature: "Team management + roles",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "yes",
    buildFromScratch: "no",
  },
  {
    feature: "Feature-organized codebase (no framework lock-in)",
    thisStarter: "yes",
    freeBoilerplate: "partial",
    heavierStarter: "no",
    buildFromScratch: "yes",
  },
  {
    feature: "72 documentation files",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "partial",
    buildFromScratch: "no",
  },
  {
    feature: "AI-ready assistant pattern with plan gating + quotas",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "no",
    buildFromScratch: "no",
  },
  {
    feature: "Working CRUD example with plan gating",
    thisStarter: "yes",
    freeBoilerplate: "no",
    heavierStarter: "partial",
    buildFromScratch: "no",
  },
  {
    feature: "Setup time under 15 minutes",
    thisStarter: "yes",
    freeBoilerplate: "yes",
    heavierStarter: "partial",
    buildFromScratch: "no",
  },
];

function StatusIcon({ value }: { value: "yes" | "no" | "partial" }) {
  if (value === "yes") return <Check className="h-4 w-4 text-orange-500" />;
  if (value === "no") return <X className="h-4 w-4 text-muted-foreground/40" />;
  return <Minus className="h-4 w-4 text-muted-foreground/60" />;
}

export function ComparisonSection() {
  return (
    <section id="compare" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Why this starter instead of the alternatives
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Most starters connect Stripe and leave you to figure out plan
            enforcement yourself. This one ships the part that actually matters.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-medium text-foreground">
                  Feature
                </th>
                <th className="pb-3 px-4 text-center font-medium text-orange-500">
                  This Starter
                </th>
                <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                  Free Boilerplate
                </th>
                <th className="pb-3 px-4 text-center font-medium text-muted-foreground">
                  Heavier Starter
                </th>
                <th className="pb-3 pl-4 text-center font-medium text-muted-foreground">
                  Build From Scratch
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex justify-center">
                      <StatusIcon value={row.thisStarter} />
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex justify-center">
                      <StatusIcon value={row.freeBoilerplate} />
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex justify-center">
                      <StatusIcon value={row.heavierStarter} />
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-center">
                    <span className="inline-flex justify-center">
                      <StatusIcon value={row.buildFromScratch} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 sm:hidden">
          {rows.map((row) => (
            <div key={row.feature} className="rounded-lg border bg-card p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                {row.feature}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <StatusIcon value={row.thisStarter} />
                  <span className="text-orange-500 font-medium">
                    This Starter
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon value={row.freeBoilerplate} />
                  Free Boilerplate
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon value={row.heavierStarter} />
                  Heavier Starter
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon value={row.buildFromScratch} />
                  From Scratch
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 rounded-lg border bg-card p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            The practical difference
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Other starters ship Stripe integration. This starter ships Stripe
            integration <em>plus</em> the enforcement layer that makes plans
            actually do something. You can gate any feature or enforce any usage
            quota in two lines of code.
          </p>
        </div>
      </div>
    </section>
  );
}
