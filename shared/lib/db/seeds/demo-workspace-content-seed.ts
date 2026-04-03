import { subDays } from "date-fns";

import { defaultAiModelId, getAllAiModelIds } from "@/shared/lib/ai/models";
import { db } from "@/shared/lib/db/prisma";
import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

const DEMO_TASKS = [
  {
    code: "TASK-1",
    title: "Polish onboarding copy",
    description: "Tighten the first-run messaging across dashboard cards.",
    status: TaskStatus.IN_PROGRESS,
    label: TaskLabel.DOCUMENTATION,
    priority: TaskPriority.MEDIUM,
    createdAt: subDays(new Date(), 1),
  },
  {
    code: "TASK-2",
    title: "Review team invitation flow",
    description: "Confirm owner-only actions and invitation states stay obvious.",
    status: TaskStatus.TODO,
    label: TaskLabel.FEATURE,
    priority: TaskPriority.HIGH,
    createdAt: subDays(new Date(), 2),
  },
  {
    code: "TASK-3",
    title: "Fix usage meter empty state",
    description: "Handle the first billing cycle before usage counters exist.",
    status: TaskStatus.DONE,
    label: TaskLabel.BUG,
    priority: TaskPriority.MEDIUM,
    createdAt: subDays(new Date(), 3),
  },
  {
    code: "TASK-4",
    title: "Draft billing setup guide",
    description: "Document Stripe test mode, price IDs, and webhook forwarding.",
    status: TaskStatus.BACKLOG,
    label: TaskLabel.DOCUMENTATION,
    priority: TaskPriority.LOW,
    createdAt: subDays(new Date(), 5),
  },
];

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
    { limitKey: "tasksPerMonth", count: 24 },
    { limitKey: "aiRequestsPerMonth", count: 12 },
    { limitKey: "emailSyncsPerMonth", count: 6 },
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

async function seedAuditLogs(organizationId: string, actorUserId: string) {
  await db.auditLog.deleteMany({
    where: {
      organizationId,
      event: { startsWith: "seed.demo." },
    },
  });

  await db.auditLog.createMany({
    data: [
      {
        organizationId,
        actorUserId,
        event: "seed.demo.task_reviewed",
        entityType: "task",
        entityId: "TASK-1",
        summary: 'Reviewed task "Polish onboarding copy"',
      },
      {
        organizationId,
        actorUserId,
        event: "seed.demo.member_joined",
        entityType: "member",
        entityId: "teammate@starter.local",
        summary: "Taylor Demo joined the workspace",
      },
      {
        organizationId,
        actorUserId,
        event: "seed.demo.billing_checked",
        entityType: "billing",
        entityId: "seed-demo-subscription",
        summary: "Billing settings were reviewed in test mode",
      },
    ],
  });
}

async function seedNotifications(organizationId: string, userId: string) {
  await db.notification.deleteMany({
    where: {
      organizationId,
      userId,
      type: { startsWith: "seed.demo." },
    },
  });

  await db.notification.createMany({
    data: [
      {
        organizationId,
        userId,
        type: "seed.demo.onboarding",
        title: "Demo workspace ready",
        body: "The seed added tasks, usage, and activity so the dashboard feels populated immediately.",
        href: "/dashboard",
      },
      {
        organizationId,
        userId,
        type: "seed.demo.billing",
        title: "Stripe test mode note",
        body: "Use the billing guide in docs/ to wire real Stripe price IDs and webhooks.",
        href: "/settings/billing",
      },
    ],
  });
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
      seats: 2,
    },
    create: {
      id: "seed-demo-subscription",
      plan: "pro",
      referenceId: organizationId,
      status: "active",
      billingInterval: "month",
      periodStart: subDays(now, 2),
      periodEnd,
      seats: 2,
    },
  });
}

async function seedAiSettings(organizationId: string) {
  await db.organizationAiSettings.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
      defaultModelId: defaultAiModelId,
      allowedModelIds: getAllAiModelIds(),
    },
  });
}

export async function seedDemoWorkspaceContent(input: {
  organizationId: string;
  ownerUserId: string;
}) {
  await Promise.all([
    seedAiSettings(input.organizationId),
    seedSubscription(input.organizationId),
    seedTasks(input.organizationId),
    seedUsageCounters(input.organizationId),
    seedAuditLogs(input.organizationId, input.ownerUserId),
    seedNotifications(input.organizationId, input.ownerUserId),
  ]);
}
