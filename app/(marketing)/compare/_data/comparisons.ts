export type ComparisonCell = string | boolean;

export type ComparisonFeatureRow = {
  feature: string;
  tenviq: ComparisonCell;
  competitor: ComparisonCell;
};

export type ComparisonSideBySide = {
  topic: string;
  competitor: string;
  tenviq: string;
};

export type Comparison = {
  slug: string;
  competitor: string;
  competitorUrl?: string;
  title: string;
  description: string;
  tagline: string;
  chooseCompetitorWhen: string[];
  chooseTenviqWhen: string[];
  sideBySide: ComparisonSideBySide[];
  featureTable: ComparisonFeatureRow[];
  tenviqWins: string[];
  competitorWins: string[];
  verdict: string;
};

export const comparisons: Comparison[] = [
  {
    slug: "tenviq-vs-makerkit",
    competitor: "Makerkit",
    competitorUrl: "https://makerkit.dev",
    title: "Tenviq vs Makerkit",
    description:
      "Makerkit is a feature-heavy B2B boilerplate. Tenviq is a leaner B2B foundation optimized for technical founders who want to stay fast after the first month. Here is how to choose.",
    tagline:
      "Both target serious B2B SaaS. The difference is how much you want to absorb before you start shipping.",
    chooseCompetitorWhen: [
      "you want the widest possible feature surface out of the box",
      "you are comfortable spending a week or two mapping the internal architecture",
      "you plan to ship multiple apps and want a kit that covers every variant",
      "you value long-form docs and an established buyer community",
    ],
    chooseTenviqWhen: [
      "you want a focused B2B foundation you can reason about in a single afternoon",
      "you prefer reading the source instead of reading a framework on top of a framework",
      "you are building one serious product, not a portfolio of starters",
      "you want to customize pricing, plans, and admin without unwinding abstractions",
    ],
    sideBySide: [
      {
        topic: "Scope",
        competitor:
          "Broad. Multiple kits (Next.js, Remix, Supabase, Turbo) and many optional modules.",
        tenviq:
          "Narrow and intentional. One Next.js app, one Prisma schema, one opinionated shape.",
      },
      {
        topic: "Learning curve",
        competitor:
          "Heavier. You trade absorption time for coverage. Great once internalized.",
        tenviq:
          "Lighter. Feature folders are flat and the wiring is visible without a guided tour.",
      },
      {
        topic: "Codebase feel",
        competitor:
          "Layered abstractions designed to support many variants of the same starter.",
        tenviq:
          "Direct code. Server actions + feature modules. Less framework-on-framework.",
      },
      {
        topic: "Billing",
        competitor:
          "Full Stripe + subscription plumbing with extensive hooks.",
        tenviq:
          "Stripe + better-auth integration. Plan gating is treated as product logic.",
      },
      {
        topic: "Admin",
        competitor: "Admin surface available depending on kit and tier.",
        tenviq:
          "Admin panel ships by default. Users, impersonation, usage — visible from day one.",
      },
      {
        topic: "Pricing",
        competitor: "Premium pricing, tiered by kit and support level.",
        tenviq:
          "One-time purchase. Founding seat pricing for early buyers, lifetime updates.",
      },
    ],
    featureTable: [
      { feature: "Multi-tenant organizations", tenviq: true, competitor: true },
      { feature: "Invitations & roles", tenviq: true, competitor: true },
      { feature: "Stripe billing", tenviq: true, competitor: true },
      { feature: "Plan-gated features", tenviq: true, competitor: "Partial" },
      { feature: "Admin panel", tenviq: true, competitor: "Tier-dependent" },
      { feature: "AI assistant scaffold", tenviq: true, competitor: "Add-on" },
      {
        feature: "Single opinionated stack",
        tenviq: "Next.js + Prisma + Postgres",
        competitor: "Multiple kit variants",
      },
      {
        feature: "Time to first understand",
        tenviq: "Hours",
        competitor: "Days",
      },
      { feature: "Lifetime updates", tenviq: true, competitor: "Tier-dependent" },
      {
        feature: "Pricing model",
        tenviq: "One-time",
        competitor: "One-time tiered",
      },
    ],
    tenviqWins: [
      "Faster to understand. You can read every folder in one sitting.",
      "Plan gating is wired as product logic, not as a checkout afterthought.",
      "Admin and account surfaces already feel credible in demos.",
      "Single stack means fewer decisions to undo when you customize.",
    ],
    competitorWins: [
      "Broader feature surface if you want everything pre-built.",
      "Multiple stack variants if you want a specific framework combo.",
      "Established community and long-form tutorials.",
    ],
    verdict:
      "Buy Makerkit if you want the most complete B2B kit on the market and you do not mind the absorption curve. Buy Tenviq if you want the same B2B depth in a codebase you can fully understand in a day and customize without fighting layers.",
  },
  {
    slug: "tenviq-vs-supastarter",
    competitor: "Supastarter",
    competitorUrl: "https://supastarter.dev",
    title: "Tenviq vs Supastarter",
    description:
      "Supastarter is optimized for teams building on Supabase. Tenviq is optimized for teams that want Prisma + Postgres freedom with the same B2B depth. Here is how to choose.",
    tagline:
      "Both are serious B2B starters. The split is mostly about your database and auth preferences.",
    chooseCompetitorWhen: [
      "your entire stack is already anchored around Supabase",
      "you want row-level security policies as your primary authorization layer",
      "you value Supabase's hosted auth, storage, and realtime out of the box",
      "you like Drizzle as your ORM and do not need Prisma tooling",
    ],
    chooseTenviqWhen: [
      "you want Prisma's schema ergonomics and migration workflow",
      "you prefer authorization handled in application code, not SQL policies",
      "you want the freedom to host Postgres anywhere (Neon, Supabase, RDS, self-host)",
      "you want better-auth's flexibility for B2B flows (orgs, 2FA, OAuth linking)",
    ],
    sideBySide: [
      {
        topic: "Database",
        competitor: "Supabase Postgres with RLS as the primary access layer.",
        tenviq:
          "Any Postgres. Prisma schema + migrations. Authorization handled in code.",
      },
      {
        topic: "Auth",
        competitor: "Supabase Auth with its own JWT and session model.",
        tenviq:
          "better-auth with organization plugin, 2FA, OAuth, session management.",
      },
      {
        topic: "ORM",
        competitor: "Drizzle (type-safe SQL builder).",
        tenviq: "Prisma (declarative schema, migrations, Prisma Studio).",
      },
      {
        topic: "Vendor coupling",
        competitor: "Tight integration with Supabase services.",
        tenviq:
          "Provider-agnostic. Swap Postgres host, email, AI provider at will.",
      },
      {
        topic: "Billing",
        competitor: "Stripe integration wired through Supabase patterns.",
        tenviq:
          "Stripe via @better-auth/stripe with plan-gated product logic.",
      },
      {
        topic: "Admin",
        competitor: "Available depending on plan.",
        tenviq:
          "Admin panel ships by default with users, orgs, usage, impersonation.",
      },
    ],
    featureTable: [
      { feature: "Multi-tenant organizations", tenviq: true, competitor: true },
      { feature: "Row-level security", tenviq: "App-layer checks", competitor: true },
      { feature: "Database portability", tenviq: "Any Postgres", competitor: "Supabase" },
      { feature: "ORM", tenviq: "Prisma", competitor: "Drizzle" },
      { feature: "Admin panel", tenviq: true, competitor: "Plan-dependent" },
      { feature: "AI assistant scaffold", tenviq: true, competitor: "Add-on" },
      { feature: "Storage", tenviq: "Bring your own", competitor: "Supabase Storage" },
      { feature: "Realtime", tenviq: "Bring your own", competitor: "Supabase Realtime" },
      {
        feature: "Pricing model",
        tenviq: "One-time",
        competitor: "One-time tiered",
      },
    ],
    tenviqWins: [
      "Database portability. Move Postgres hosts without rewriting auth.",
      "Prisma schema + migrations if you prefer declarative models.",
      "Admin panel ships in the base product, not behind a tier.",
      "better-auth flexibility for complex B2B auth flows.",
    ],
    competitorWins: [
      "Supabase Storage and Realtime are genuinely useful out of the box.",
      "RLS is a strong default if you want DB-enforced authorization.",
      "Tighter integration if you already run on Supabase.",
    ],
    verdict:
      "Buy Supastarter if Supabase is already your platform and you want its services wired end-to-end. Buy Tenviq if you want Prisma + any Postgres host, better-auth, and an admin panel in the base product — without committing to a single backend vendor.",
  },
  {
    slug: "tenviq-vs-next-forge",
    competitor: "Next-Forge",
    competitorUrl: "https://www.next-forge.com",
    title: "Tenviq vs Next-Forge",
    description:
      "Next-Forge is a Turborepo template with multiple apps and packages. Tenviq is a single Next.js app focused on B2B foundations. Here is how to choose.",
    tagline:
      "Next-Forge is a monorepo platform. Tenviq is a product you ship. Different scope, different job.",
    chooseCompetitorWhen: [
      "you want a Turborepo with marketing site, app, docs, API, and admin as separate apps",
      "you are building a multi-product company and need a monorepo from day one",
      "you value the full Vercel stack opinions and want all of them wired together",
      "you have the bandwidth to manage package boundaries and shared types across apps",
    ],
    chooseTenviqWhen: [
      "you are building one product and do not want monorepo overhead",
      "you want a single Next.js app with marketing, app, and admin in the same codebase",
      "you want to ship in weeks, not spend a sprint wiring Turborepo",
      "you prefer feature modules over package boundaries as your organization unit",
    ],
    sideBySide: [
      {
        topic: "Architecture",
        competitor: "Turborepo with multiple apps (web, app, api, docs).",
        tenviq:
          "Single Next.js App Router app with route groups for marketing/app/auth.",
      },
      {
        topic: "Learning curve",
        competitor: "Monorepo tooling, package boundaries, shared types.",
        tenviq:
          "Standard Next.js. Feature folders. No monorepo concepts to learn.",
      },
      {
        topic: "Scope",
        competitor:
          "Platform template. Designed for teams running multiple products.",
        tenviq:
          "Product starter. Designed for one serious B2B SaaS you actually ship.",
      },
      {
        topic: "Opinions",
        competitor:
          "Opinionated full stack (auth, analytics, CMS, feature flags, queue).",
        tenviq:
          "Opinionated B2B foundation (orgs, billing, admin, AI assistant).",
      },
      {
        topic: "Onboarding speed",
        competitor: "Days to wire env vars, understand packages, pick integrations.",
        tenviq:
          "Hours. Clone, set env, migrate, and you have a working B2B app.",
      },
      {
        topic: "Admin",
        competitor: "No built-in admin panel.",
        tenviq:
          "Admin panel ships with users, orgs, usage, feature flags.",
      },
    ],
    featureTable: [
      { feature: "Monorepo (Turborepo)", tenviq: false, competitor: true },
      { feature: "Single Next.js app", tenviq: true, competitor: "Multiple apps" },
      { feature: "Multi-tenant organizations", tenviq: true, competitor: false },
      { feature: "Stripe billing", tenviq: true, competitor: "Add-on" },
      { feature: "Admin panel", tenviq: true, competitor: false },
      { feature: "AI assistant scaffold", tenviq: true, competitor: false },
      { feature: "Feature flags", tenviq: "Hooks-ready", competitor: true },
      { feature: "Analytics wired", tenviq: "PostHog + Vercel", competitor: true },
      { feature: "Best for", tenviq: "One B2B product", competitor: "Multiple apps" },
      { feature: "Time to first ship", tenviq: "Hours", competitor: "Days" },
    ],
    tenviqWins: [
      "No monorepo overhead if you are building one product.",
      "Organizations, billing, and admin are already part of the product shape.",
      "Faster to understand and customize when you are a small team.",
      "One-time purchase with lifetime updates instead of open-source you maintain alone.",
    ],
    competitorWins: [
      "Monorepo is the right call when you run multiple products.",
      "Broader platform opinions (CMS, queue, feature flags) already wired.",
      "Open source and free.",
    ],
    verdict:
      "Use Next-Forge if you are a team that will run multiple apps and want a Turborepo foundation. Buy Tenviq if you are a technical founder building one serious B2B SaaS and want to skip the monorepo tax.",
  },
  {
    slug: "tenviq-vs-divjoy",
    competitor: "Divjoy",
    competitorUrl: "https://divjoy.com",
    title: "Tenviq vs Divjoy",
    description:
      "Divjoy is a React template generator for quickly scaffolding web apps. Tenviq is a complete B2B SaaS foundation. Here is how to choose.",
    tagline:
      "Divjoy generates a starting point. Tenviq ships a product. Different job, different buyer.",
    chooseCompetitorWhen: [
      "you want a visual generator to pick a stack and download a template",
      "you are building a simple CRUD app or a non-B2B product",
      "you prefer to wire your own auth, billing, and org logic from scratch",
      "you want to explore multiple stack combos before committing",
    ],
    chooseTenviqWhen: [
      "you already know you are building a B2B SaaS",
      "you want multi-tenant organizations, admin, and plan gating already wired",
      "you want to skip the generator step and start from a product-shaped codebase",
      "you value opinionated depth over configurable breadth",
    ],
    sideBySide: [
      {
        topic: "What you get",
        competitor: "A generated project tailored to your picked options.",
        tenviq:
          "A complete B2B SaaS codebase with auth, billing, orgs, admin, AI assistant.",
      },
      {
        topic: "Target buyer",
        competitor:
          "Developers who want a scaffold and will build the product on top.",
        tenviq:
          "Technical founders who want the product shape already in place.",
      },
      {
        topic: "B2B features",
        competitor: "Basic. You add orgs, roles, admin yourself.",
        tenviq:
          "Organizations, invitations, roles, admin panel, billing gating — by default.",
      },
      {
        topic: "Billing",
        competitor: "Stripe integration via chosen template.",
        tenviq:
          "Stripe + plan-gated product logic. Billing shapes the product.",
      },
      {
        topic: "Philosophy",
        competitor: "Configurable scaffolding.",
        tenviq: "Opinionated product foundation.",
      },
      {
        topic: "Time to real B2B app",
        competitor: "Weeks after the generator.",
        tenviq: "Days. The foundation is already B2B-shaped.",
      },
    ],
    featureTable: [
      { feature: "Template generator", tenviq: false, competitor: true },
      { feature: "Multi-tenant organizations", tenviq: true, competitor: false },
      { feature: "Admin panel", tenviq: true, competitor: false },
      { feature: "Plan-gated features", tenviq: true, competitor: false },
      { feature: "AI assistant scaffold", tenviq: true, competitor: false },
      { feature: "Stack choice", tenviq: "Next.js + Prisma (fixed)", competitor: "Configurable" },
      { feature: "Fit for B2B SaaS", tenviq: "Built for it", competitor: "Bring your own" },
      { feature: "Pricing model", tenviq: "One-time", competitor: "One-time" },
    ],
    tenviqWins: [
      "You skip the scaffolding step and start from a B2B product shape.",
      "Orgs, admin, and plan gating are wired, not on your todo list.",
      "Codebase is opinionated and readable, not generated by a template engine.",
      "AI assistant and admin surfaces already feel credible in demos.",
    ],
    competitorWins: [
      "Configurable stack if you want to pick the pieces.",
      "Cheaper entry point for simple non-B2B apps.",
      "Useful if you just want a scaffold and will build B2B logic yourself.",
    ],
    verdict:
      "Use Divjoy if you want a visual generator for a simple app and plan to build B2B logic yourself. Buy Tenviq if you want to skip scaffolding entirely and start from a B2B SaaS foundation that already shipped orgs, admin, and billing gating.",
  },
  {
    slug: "tenviq-vs-shipfast",
    competitor: "ShipFast",
    competitorUrl: "https://shipfa.st",
    title: "Tenviq vs ShipFast",
    description:
      "A practical comparison for technical founders deciding whether they need the fastest path to launch or a more serious B2B foundation from day one.",
    tagline:
      "ShipFast is optimized for solo momentum. Tenviq is optimized for B2B depth. Pick based on your roadmap, not the headline features.",
    chooseCompetitorWhen: [
      "you care most about shipping fast with the lightest possible initial setup",
      "you do not need team workspaces or admin depth on day one",
      "you are building a simpler solo product where B2B structure would be overkill",
      "you want to lean into ShipFast's creator ecosystem and solo-founder momentum",
    ],
    chooseTenviqWhen: [
      "your roadmap clearly includes teams, roles, and invitations",
      "you want admin surfaces early because support, sales, and ops matter",
      "billing needs to control what the product actually allows",
      "you care about time-to-understand, not just time-to-install",
      "you want the codebase to stay readable after the first month of customization",
    ],
    sideBySide: [
      {
        topic: "Best fit",
        competitor:
          "Solo founders who want the fastest route to a simple SaaS, AI tool, or online business.",
        tenviq:
          "Technical founders who need a more serious B2B base with teams, admin, and enforced billing logic.",
      },
      {
        topic: "Positioning",
        competitor: "Launch fast and make your first dollars online quickly.",
        tenviq:
          "Start from real B2B foundations without buying a heavy starter kit.",
      },
      {
        topic: "Teams & organizations",
        competitor: "Not a day-one requirement.",
        tenviq:
          "Organizations, invitations, active org switching, tenant-aware flows.",
      },
      {
        topic: "Admin surfaces",
        competitor: "Optimized around speed to launch.",
        tenviq: "Admin flows usable in demos and support workflows.",
      },
      {
        topic: "Billing inside the app",
        competitor: "Wired quickly; shape product logic later.",
        tenviq: "Plan gating + usage rules shape what the product allows.",
      },
      {
        topic: "Codebase feel",
        competitor: "Lean and momentum-driven.",
        tenviq: "Feature-first and intentionally readable.",
      },
    ],
    featureTable: [
      { feature: "Multi-tenant organizations", tenviq: true, competitor: false },
      { feature: "Invitations & roles", tenviq: true, competitor: false },
      { feature: "Admin panel", tenviq: true, competitor: false },
      { feature: "Plan-gated features", tenviq: true, competitor: "Partial" },
      { feature: "Stripe billing", tenviq: true, competitor: true },
      { feature: "AI assistant scaffold", tenviq: true, competitor: true },
      { feature: "Solo-founder speed", tenviq: "Good", competitor: "Excellent" },
      { feature: "B2B depth", tenviq: "Excellent", competitor: "Limited" },
      { feature: "Creator community", tenviq: "Growing", competitor: "Established" },
    ],
    tenviqWins: [
      "Organizations, roles, and invitations are already part of the product shape.",
      "Admin and account surfaces help the product feel credible earlier.",
      "Billing logic is treated as product logic, not just checkout plumbing.",
      "Codebase is optimized for local reasoning, not hidden internal architecture.",
    ],
    competitorWins: [
      "Stronger solo-founder brand gravity and market familiarity.",
      "Clearer default pick when the goal is simply launching something profitable fast.",
      "Likely the better choice if B2B depth would just slow your first version down.",
    ],
    verdict:
      "Buy Tenviq if you already know your SaaS needs more than a fast login and a checkout button. If your roadmap clearly includes teams, admin visibility, product rules tied to billing, and a more serious B2B app shape, Tenviq is built for that job. If not, ShipFast may genuinely be the better fit.",
  },
];

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
