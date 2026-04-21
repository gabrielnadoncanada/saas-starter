export type FeatureColumn = {
  label: string;
  title: string;
  items: string[];
};

export const featureColumns: FeatureColumn[] = [
  {
    label: "Auth",
    title: "Auth that already feels done",
    items: [
      "Email + password, OAuth, and magic links",
      "Two-factor authentication",
      "Password reset and email verification",
      "Session and device management",
      "Account linking and soft delete",
    ],
  },
  {
    label: "Billing",
    title: "Billing that controls the product",
    items: [
      "Stripe checkout and customer portal",
      "Capabilities and usage limits",
      "Webhook-synced billing state",
      "Config-driven plan gating",
      "Ready for monthly and yearly plans",
    ],
  },
  {
    label: "Teams",
    title: "Real team workspaces",
    items: [
      "Organizations, invites, and switching",
      "Owner, Admin, and Member roles",
      "Tenant-scoped queries and mutations",
      "Seat-aware permissions",
      "Per-organization activity history",
    ],
  },
  {
    label: "Admin",
    title: "Admin surfaces buyers expect",
    items: [
      "User and organization directories",
      "Ban, unban, and impersonation",
      "Plan and signup visibility",
      "Recent activity stream",
      "Role-gated admin routes",
    ],
  },
  {
    label: "AI",
    title: "AI included in the product",
    items: [
      "Org-scoped assistant experience",
      "Streaming chat with tool calls",
      "Chart and document artifacts",
      "Saved conversations",
      "Usage-aware access",
    ],
  },
  {
    label: "DX",
    title: "A codebase you can still read later",
    items: [
      "Feature-first structure",
      "Thin routes, server actions, and Zod",
      "Prisma schema and seed data included",
      "Email templates and local docs",
      "Built to customize without unlearning it first",
    ],
  },
];
