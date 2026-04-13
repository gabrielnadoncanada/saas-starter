import { MARKETING_DOC_COUNT } from "@/features/marketing/site";

const includedItems = [
  {
    label: "Source code",
    detail: "Next.js 16, React 19, TypeScript strict, Tailwind v4, shadcn/ui",
  },
  {
    label: "Auth system",
    detail:
      "Magic link, Google, GitHub OAuth, account linking, session management",
  },
  {
    label: "Billing system",
    detail: "Stripe checkout, webhooks, customer portal, 3 pricing models",
  },
  {
    label: "Plan gating",
    detail:
      "Capability checks, usage limits, upgrade prompts, centralized config",
  },
  {
    label: "Team layer",
    detail: "Roles, invitations, team switching, member limits",
  },
  {
    label: "Dashboard",
    detail: "Sidebar, command menu, dark mode, settings",
  },
  {
    label: "AI-ready module",
    detail: "Plan-gated assistant, real task actions, provider switching",
  },
  {
    label: "CRUD example",
    detail:
      "Tasks with a simple create/edit/delete flow, server actions, Zod, and plan-gated creation",
  },
  {
    label: "Database",
    detail:
      "PostgreSQL + Prisma, migrations, seed script, feature-split schema",
  },
  {
    label: `${MARKETING_DOC_COUNT} docs`,
    detail: "Setup, architecture, 31 customization guides, troubleshooting",
  },
];

export function IncludedItemsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            What you get
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            One purchase. Full source code. Everything below is included.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {includedItems.map((item) => (
            <div key={item.label} className="rounded-lg border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
