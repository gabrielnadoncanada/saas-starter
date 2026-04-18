import { subDays, subHours } from "date-fns";

import { TaskLabel, TaskPriority, TaskStatus } from "@/lib/db/enums";
import { db } from "@/lib/db/prisma";

type DemoTaskSeed = {
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  createdAt: Date;
};

const DEMO_TASK_TEMPLATES: Array<{
  title: string;
  description: string;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  daysAgo: number;
  hourOffset: number;
}> = [
  { title: "Polish onboarding copy", description: "Tighten the first-run messaging across dashboard cards.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.DOCUMENTATION, priority: TaskPriority.MEDIUM, daysAgo: 0, hourOffset: 3 },
  { title: "Review team invitation flow", description: "Confirm owner-only actions and invitation states stay obvious.", status: TaskStatus.TODO, label: TaskLabel.FEATURE, priority: TaskPriority.HIGH, daysAgo: 0, hourOffset: 7 },
  { title: "Fix usage meter empty state", description: "Handle the first billing cycle before usage counters exist.", status: TaskStatus.DONE, label: TaskLabel.BUG, priority: TaskPriority.MEDIUM, daysAgo: 1, hourOffset: 5 },
  { title: "Draft billing setup guide", description: "Document Stripe test mode, price IDs, and webhook forwarding.", status: TaskStatus.BACKLOG, label: TaskLabel.DOCUMENTATION, priority: TaskPriority.LOW, daysAgo: 1, hourOffset: 10 },
  { title: "Wire AI assistant tool calls", description: "Connect the assistant to the read-only org tools.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.FEATURE, priority: TaskPriority.HIGH, daysAgo: 2, hourOffset: 4 },
  { title: "Refresh empty states across settings", description: "Replace placeholder copy with action-oriented messages.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.LOW, daysAgo: 2, hourOffset: 8 },
  { title: "Investigate webhook retries", description: "Add structured logs around Stripe event idempotency.", status: TaskStatus.TODO, label: TaskLabel.BUG, priority: TaskPriority.MEDIUM, daysAgo: 3, hourOffset: 2 },
  { title: "Audit role-based gating", description: "Ensure owner-only mutations are not callable from member sessions.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.BUG, priority: TaskPriority.HIGH, daysAgo: 3, hourOffset: 9 },
  { title: "Tune AI credit accounting", description: "Verify token usage rolls up to the monthly counter correctly.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.MEDIUM, daysAgo: 4, hourOffset: 6 },
  { title: "Add sparklines to dashboard KPIs", description: "Replace static numbers with 14-day micro charts.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.MEDIUM, daysAgo: 4, hourOffset: 11 },
  { title: "Migrate stored files cleanup job", description: "Schedule orphaned storage purges weekly.", status: TaskStatus.BACKLOG, label: TaskLabel.FEATURE, priority: TaskPriority.LOW, daysAgo: 5, hourOffset: 3 },
  { title: "Rebrand from ember to brand tokens", description: "Generic brand token so buyers can rebrand in one place.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.MEDIUM, daysAgo: 5, hourOffset: 14 },
  { title: "Tighten organization invitation copy", description: "Make the invite email read like a real product, not a demo.", status: TaskStatus.DONE, label: TaskLabel.DOCUMENTATION, priority: TaskPriority.LOW, daysAgo: 6, hourOffset: 5 },
  { title: "Smoke test billing portal redirect", description: "Cover the resume-checkout-after-sign-in path end to end.", status: TaskStatus.DONE, label: TaskLabel.BUG, priority: TaskPriority.HIGH, daysAgo: 6, hourOffset: 9 },
  { title: "Compress marketing screenshots", description: "Bring hero/showcase images under 300KB for faster loads.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.LOW, daysAgo: 7, hourOffset: 4 },
  { title: "Sketch dashboard activity feed", description: "Merge tasks, members, and AI events into a single timeline.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.FEATURE, priority: TaskPriority.MEDIUM, daysAgo: 7, hourOffset: 10 },
  { title: "Validate seed data against fresh installs", description: "Ensure seeds run cleanly on a brand new database.", status: TaskStatus.DONE, label: TaskLabel.BUG, priority: TaskPriority.MEDIUM, daysAgo: 8, hourOffset: 7 },
  { title: "Document customization paths", description: "Where to swap fonts, colors, branding, plans, and product copy.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.DOCUMENTATION, priority: TaskPriority.HIGH, daysAgo: 8, hourOffset: 12 },
  { title: "Replace generic Lucide icons in feature cards", description: "Pick a more cohesive icon set for the marketing grid.", status: TaskStatus.BACKLOG, label: TaskLabel.FEATURE, priority: TaskPriority.LOW, daysAgo: 9, hourOffset: 6 },
  { title: "Add testimonials placeholder section", description: "Wire a section for buyer testimonials once we have them.", status: TaskStatus.BACKLOG, label: TaskLabel.FEATURE, priority: TaskPriority.LOW, daysAgo: 9, hourOffset: 13 },
  { title: "Tighten Tailwind v4 token mapping", description: "Map every brand color through @theme inline correctly.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.HIGH, daysAgo: 10, hourOffset: 4 },
  { title: "Audit accessibility on marketing CTAs", description: "Verify focus states and contrast across the landing page.", status: TaskStatus.TODO, label: TaskLabel.BUG, priority: TaskPriority.MEDIUM, daysAgo: 10, hourOffset: 11 },
  { title: "Plan multi-tenant data isolation tests", description: "Confirm cross-org reads are blocked at every entry point.", status: TaskStatus.IN_PROGRESS, label: TaskLabel.BUG, priority: TaskPriority.HIGH, daysAgo: 11, hourOffset: 8 },
  { title: "Set up Vitest CI workflow", description: "Run the test suite on every push to main.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.MEDIUM, daysAgo: 12, hourOffset: 5 },
  { title: "Bootstrap the dashboard overview", description: "Wire the first version of the organization dashboard.", status: TaskStatus.DONE, label: TaskLabel.FEATURE, priority: TaskPriority.HIGH, daysAgo: 13, hourOffset: 9 },
];

const DEMO_TASKS: DemoTaskSeed[] = DEMO_TASK_TEMPLATES.map((template, index) => ({
  code: `TASK-${index + 1}`,
  title: template.title,
  description: template.description,
  status: template.status,
  label: template.label,
  priority: template.priority,
  createdAt: subHours(subDays(new Date(), template.daysAgo), template.hourOffset),
}));

function getPeriodStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

async function seedTasks(organizationId: string) {
  await db.task.deleteMany({
    where: {
      organizationId,
      code: { in: DEMO_TASKS.map((task) => task.code) },
    },
  });

  await db.task.createMany({
    data: DEMO_TASKS.map((task) => ({
      organizationId,
      ...task,
    })),
  });
}

async function seedUsageCounters(organizationId: string) {
  const periodStart = getPeriodStart();
  const usageRows = [
    { limitKey: "tasksPerMonth", count: DEMO_TASKS.length },
    { limitKey: "aiCredits", count: 312 },
  ] as const;

  for (const usage of usageRows) {
    await db.usageCounter.upsert({
      where: {
        organizationId_limitKey_periodStart: {
          organizationId,
          limitKey: usage.limitKey,
          periodStart,
        },
      },
      update: { count: usage.count },
      create: {
        organizationId,
        limitKey: usage.limitKey,
        periodStart,
        count: usage.count,
      },
    });
  }
}

const DEMO_AI_CONVERSATIONS: Array<{
  id: string;
  surface: string;
  title: string;
  daysAgo: number;
  hourOffset: number;
}> = [
  { id: "seed-ai-conv-1", surface: "dashboard", title: "Summarize team progress this week", daysAgo: 0, hourOffset: 2 },
  { id: "seed-ai-conv-2", surface: "tasks", title: "Group open bugs by area", daysAgo: 1, hourOffset: 6 },
  { id: "seed-ai-conv-3", surface: "tasks", title: "Suggest priorities for the next sprint", daysAgo: 2, hourOffset: 4 },
  { id: "seed-ai-conv-4", surface: "dashboard", title: "Explain the AI credit rollover policy", daysAgo: 3, hourOffset: 9 },
  { id: "seed-ai-conv-5", surface: "tasks", title: "Draft a release note for billing fixes", daysAgo: 4, hourOffset: 7 },
  { id: "seed-ai-conv-6", surface: "dashboard", title: "Compare task throughput vs last month", daysAgo: 5, hourOffset: 5 },
  { id: "seed-ai-conv-7", surface: "tasks", title: "Find tasks mentioning Stripe", daysAgo: 6, hourOffset: 3 },
  { id: "seed-ai-conv-8", surface: "dashboard", title: "Highlight teammates with no activity", daysAgo: 7, hourOffset: 10 },
  { id: "seed-ai-conv-9", surface: "tasks", title: "Translate the onboarding copy to French", daysAgo: 9, hourOffset: 8 },
  { id: "seed-ai-conv-10", surface: "dashboard", title: "Plan a 3-step launch checklist", daysAgo: 11, hourOffset: 6 },
];

async function seedAiConversations(input: {
  organizationId: string;
  ownerUserId: string;
}) {
  await db.aiConversation.deleteMany({
    where: {
      organizationId: input.organizationId,
      id: { in: DEMO_AI_CONVERSATIONS.map((c) => c.id) },
    },
  });

  for (const conv of DEMO_AI_CONVERSATIONS) {
    const createdAt = subHours(subDays(new Date(), conv.daysAgo), conv.hourOffset);

    await db.aiConversation.create({
      data: {
        id: conv.id,
        organizationId: input.organizationId,
        createdByUserId: input.ownerUserId,
        surface: conv.surface,
        title: conv.title,
        messagesJson: [
          {
            role: "user",
            content: conv.title,
          },
          {
            role: "assistant",
            content:
              "Here is a quick summary based on the organization data available right now.",
          },
        ],
        lastMessageAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
}

async function seedSubscription(organizationId: string) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 28);

  await db.subscription.upsert({
    where: { id: "seed-demo-subscription" },
    update: {
      plan: "pro",
      referenceId: organizationId,
      status: "active",
      billingInterval: "month",
      periodStart: subDays(now, 2),
      periodEnd,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: "seed-pro-monthly",
      stripeSubscriptionItemId: null,
    },
    create: {
      id: "seed-demo-subscription",
      plan: "pro",
      referenceId: organizationId,
      status: "active",
      billingInterval: "month",
      periodStart: subDays(now, 2),
      periodEnd,
      stripePriceId: "seed-pro-monthly",
    },
  });
}

export async function seedDemoOrganizationContent(input: {
  organizationId: string;
  ownerUserId: string;
}) {
  await Promise.all([
    seedSubscription(input.organizationId),
    seedTasks(input.organizationId),
    seedUsageCounters(input.organizationId),
    seedAiConversations({
      organizationId: input.organizationId,
      ownerUserId: input.ownerUserId,
    }),
  ]);
}
