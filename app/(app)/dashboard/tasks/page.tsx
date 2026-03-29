import { redirect } from "next/navigation";

import { TasksPageClient } from "@/features/tasks/components/tasks-page-client";
import {
  parseTaskTableSearchParams,
} from "@/features/tasks/schemas/task-table-search-params.schema";
import { getTasksPage } from "@/features/tasks/server/get-tasks-page";
import { buildTasksTableHref } from "@/features/tasks/utils/task-table-url";
import { routes } from "@/shared/constants/routes";

type DashboardTasksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardTasksPage({
  searchParams,
}: DashboardTasksPageProps) {
  const params = parseTaskTableSearchParams(await searchParams);
  const tasksPage = await getTasksPage(params);

  if (tasksPage.page !== params.page) {
    redirect(
      buildTasksTableHref(routes.app.tasks, {
        ...params,
        page: tasksPage.page,
      }),
    );
  }

  return <TasksPageClient tasksPage={tasksPage} />;
}

