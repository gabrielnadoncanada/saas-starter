import { redirect } from "next/navigation";

import { TasksPage } from "@/features/tasks/components/tasks-page";
import { getTasksPage } from "@/features/tasks/server/get-tasks-page";
import {
  buildTasksTableHref,
  parseTaskTableSearchParams,
} from "@/features/tasks/task-schemas";
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

  return <TasksPage tasksPage={tasksPage} />;
}
