export type TimeSavedItem = {
  label: string;
  hours: number;
};

export const timeSavedBreakdown: TimeSavedItem[] = [
  { label: "Authentication flows (email, OAuth, magic links)", hours: 40 },
  { label: "Stripe billing, plan gating & webhooks", hours: 50 },
  { label: "Multi-tenant organizations, roles & invites", hours: 35 },
  { label: "Admin panel & user management", hours: 25 },
  { label: "Dashboard, settings & account surfaces", hours: 30 },
  { label: "AI assistant integration", hours: 20 },
];
