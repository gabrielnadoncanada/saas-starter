import {
  ArrowRight,
  CreditCard,
  Database,
  LayoutDashboard,
  Lock,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Plan Gating",
    description:
      "Capability-based feature flags and usage limits. Gate any feature or enforce quotas in two lines. This is what other starters leave you to build.",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description:
      "Flat-rate subscriptions, checkout, customer portal, and webhook handling. Monthly and yearly billing out of the box.",
  },
  {
    icon: Lock,
    title: "Authentication",
    description:
      "Magic link, Google, and GitHub OAuth. Account linking, session management, and soft delete built in.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Multi-team support with roles, invitations, and team switching. Plan-enforced member limits. Ready for B2B from day one.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Shell",
    description:
      "Sidebar navigation, command menu, dark mode, responsive layout, and a full settings experience.",
  },
  {
    icon: Database,
    title: "Database + ORM",
    description:
      "PostgreSQL with Prisma. Migrations, seed scripts, and a clean schema split by feature.",
  },
  {
    icon: Settings,
    title: "Settings + Account",
    description:
      "Profile editing, linked auth providers, account deletion, and team management pages.",
  },
  {
    icon: Sparkles,
    title: "AI-ready Assistant",
    description:
      "Plan-gated assistant with real task actions and provider switching. The point is monetization-ready AI, not a black-box agent.",
  },
  {
    icon: ArrowRight,
    title: "CRUD Example",
    description:
      "Full tasks module with TanStack Table, server actions, Zod validation, and plan-gated creation. The exact pattern to replicate for your features.",
  },
];

export function MarketingFeatureGrid() {
  return (
    <section id="features" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to launch - nothing you need to learn
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Feature-organized code, not a custom framework. Read it, modify it,
            delete what you don&apos;t need. No abstractions to learn first.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className=" bg-card p-6 glass-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-md  text-white glass-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
