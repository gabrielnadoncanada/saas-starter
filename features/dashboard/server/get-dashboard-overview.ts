import "server-only";

import { subDays } from "date-fns";
import { getTranslations } from "next-intl/server";

import { listOrganizationApiKeys } from "@/features/api-keys/server/api-key-service";
import { listOrganizationAuditLogs } from "@/features/audit/server/record-audit-log";
import { hasCapability, checkLimit } from "@/features/billing/guards/plan-guards";
import { resolveOrganizationPlan } from "@/features/billing/plans/resolve-organization-plan";
import { getMonthlyUsage } from "@/features/billing/usage/usage-service";
import { getCurrentOrganization } from "@/features/organizations/server/current-organization";
import { listTasks } from "@/features/tasks/server/task-mutations";
import { getPlan } from "@/shared/config/billing.config";
import { routes } from "@/shared/constants/routes";
import { db } from "@/shared/lib/db/prisma";

function buildUsageChart(tasks: { createdAt: Date }[], locale: string) {
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(new Date(), 6 - index);

    return {
      dateKey: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      tasks: 0,
    };
  });

  for (const task of tasks) {
    const key = task.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.dateKey === key);

    if (bucket) {
      bucket.tasks += 1;
    }
  }

  return buckets.map(({ dateKey: _dateKey, ...item }) => item);
}

export async function getDashboardOverview(locale: string) {
  const t = await getTranslations("dashboard");
  const organization = await getCurrentOrganization();
  const tasks = await listTasks();
  const planId = resolveOrganizationPlan(organization);
  const plan = getPlan(planId);
  const memberCount = organization?.members?.length ?? 0;
  const taskCount = tasks.length;
  const organizationId = organization?.id ?? null;

  const [tasksUsage, aiUsage, recentActivity, apiKeys, recentTaskHistory] =
    organizationId
      ? await Promise.all([
          getMonthlyUsage(organizationId, "tasksPerMonth"),
          getMonthlyUsage(organizationId, "aiRequestsPerMonth"),
          listOrganizationAuditLogs(organizationId, 8),
          listOrganizationApiKeys(organizationId),
          db.task.findMany({
            where: {
              organizationId,
              createdAt: {
                gte: subDays(new Date(), 6),
              },
            },
            select: {
              createdAt: true,
            },
          }),
        ])
      : [0, 0, [], [], []];

  const taskLimit = checkLimit(planId, "tasksPerMonth", tasksUsage);
  const aiLimit = checkLimit(planId, "aiRequestsPerMonth", aiUsage);
  const canUseAI = hasCapability(planId, "ai.assistant");

  const checklist = [
    {
      id: "first-task",
      title: t("checklist.firstTask"),
      done: taskCount > 0,
      href: routes.app.tasks,
    },
    {
      id: "invite-team",
      title: t("checklist.inviteTeam"),
      done: memberCount > 1,
      href: routes.settings.members,
      hidden: !hasCapability(planId, "team.invite"),
    },
    {
      id: "create-api-key",
      title: t("checklist.apiKey"),
      done: apiKeys.length > 0,
      href: routes.settings.apiKeys,
      hidden: !hasCapability(planId, "api.access"),
    },
    {
      id: "try-assistant",
      title: t("checklist.tryAssistant"),
      done: aiUsage > 0,
      href: routes.app.assistant,
      hidden: !canUseAI,
    },
  ].filter((item) => !item.hidden);

  return {
    organization,
    plan,
    planId,
    memberCount,
    taskCount,
    tasksUsage,
    aiUsage,
    taskLimit,
    aiLimit,
    canUseAI,
    recentActivity,
    recentTasks: tasks.slice(0, 5),
    usageChart: buildUsageChart(recentTaskHistory, locale),
    checklist,
    apiKeyCount: apiKeys.length,
  };
}
