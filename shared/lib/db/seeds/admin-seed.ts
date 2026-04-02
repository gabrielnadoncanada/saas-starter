import { hashPassword } from "better-auth/crypto";

import { defaultAiModelId, getAllAiModelIds } from "@/shared/lib/ai/models";
import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

import { db } from "../prisma";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_ORG_SLUG = "admin-team";
const ADMIN_TASK_TARGET = 500;

const TASK_LABELS = [TaskLabel.FEATURE, TaskLabel.BUG, TaskLabel.DOCUMENTATION];
const TASK_PRIORITIES = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
];
const TASK_STATUSES = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
  TaskStatus.CANCELED,
];

function parseTaskCodeNumber(code: string | null | undefined) {
  if (!code?.startsWith("TASK-")) {
    return 0;
  }

  return Number(code.slice(5)) || 0;
}

function buildAdminTaskTitle(index: number) {
  const themes = [
    "Review onboarding flow",
    "Fix billing edge case",
    "Write setup guide",
    "Refine dashboard copy",
    "Audit organization permissions",
    "Polish tasks table",
    "Document Stripe states",
    "Clean demo data",
    "Improve assistant prompts",
    "Check email templates",
  ];

  return `${themes[index % themes.length]} #${index + 1}`;
}

function buildAdminTaskDescription(index: number) {
  return `Seeded admin task ${index + 1} for table testing, bulk actions, filters, and pagination.`;
}

function buildAdminTaskRecords(
  organizationId: string,
  startCode: number,
  count: number,
) {
  return Array.from({ length: count }, (_, offset) => {
    const index = startCode + offset;

    return {
      organizationId,
      code: `TASK-${index + 1}`,
      title: buildAdminTaskTitle(index),
      description: buildAdminTaskDescription(index),
      label: TASK_LABELS[index % TASK_LABELS.length],
      priority: TASK_PRIORITIES[index % TASK_PRIORITIES.length],
      status: TASK_STATUSES[index % TASK_STATUSES.length],
    };
  });
}

async function ensureAdminUser() {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "admin", emailVerified: true, name: "Admin" },
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "admin",
    },
  });

  const existingAccount = await db.account.findFirst({
    where: { userId: admin.id, providerId: "credential" },
  });

  if (!existingAccount) {
    await db.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: admin.id,
        providerId: "credential",
        userId: admin.id,
        password: hashedPassword,
      },
    });
  } else {
    await db.account.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword },
    });
  }

  return admin;
}

async function ensureAdminOrganization() {
  const existingOrganization = await db.organization.findFirst({
    where: { slug: ADMIN_ORG_SLUG },
  });

  if (existingOrganization) {
    return existingOrganization;
  }

  return db.organization.create({
    data: {
      id: crypto.randomUUID(),
      name: "Admin Team",
      slug: ADMIN_ORG_SLUG,
    },
  });
}

async function ensureAdminMembership(userId: string, organizationId: string) {
  const existingMembership = await db.member.findFirst({
    where: { organizationId, userId },
  });

  if (existingMembership) {
    return;
  }

  await db.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role: "owner",
    },
  });
}

async function ensureAdminTasks(organizationId: string) {
  const existingTaskCount = await db.task.count({
    where: { organizationId },
  });

  if (existingTaskCount >= ADMIN_TASK_TARGET) {
    console.log(`Admin organization already has ${existingTaskCount} tasks.`);
    return;
  }

  const latestTask = await db.task.findFirst({
    where: { organizationId },
    orderBy: { id: "desc" },
    select: { code: true },
  });

  const nextCodeNumber = parseTaskCodeNumber(latestTask?.code);
  const missingTaskCount = ADMIN_TASK_TARGET - existingTaskCount;
  const tasks = buildAdminTaskRecords(
    organizationId,
    nextCodeNumber,
    missingTaskCount,
  );

  await db.task.createMany({ data: tasks });

  console.log(`Seeded ${missingTaskCount} admin tasks.`);
}

async function ensureAdminAiSettings(organizationId: string) {
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

export async function seedAdminWorkspace() {
  const admin = await ensureAdminUser();
  const organization = await ensureAdminOrganization();

  await ensureAdminMembership(admin.id, organization.id);
  await ensureAdminAiSettings(organization.id);
  await ensureAdminTasks(organization.id);

  console.log(`Admin user ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}
