import { redirect } from "next/navigation";

import { TasksPage } from "@/features/tasks/components/tasks-page";
import { getTasksPage } from "@/features/tasks/server/get-tasks-page";
import {
  buildTasksTableHref,
  parseTaskTableSearchParams,
} from "@/features/tasks/task-table-search-params";
import { routes } from "@/shared/constants/routes";

type DashboardTasksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardTasksPage({
  searchParams,
}: DashboardTasksPageProps) {
  const nextSearchParams = await searchParams;
  const parsedParams = parseTaskTableSearchParams(nextSearchParams);
  const tasksPage = await getTasksPage(parsedParams);

  if (tasksPage.page !== parsedParams.page) {
    redirect(
      buildTasksTableHref(routes.app.tasks, {
        ...parsedParams,
        page: tasksPage.page,
      }),
    );
  }

  return <TasksPage tasksPage={tasksPage} />;
}
