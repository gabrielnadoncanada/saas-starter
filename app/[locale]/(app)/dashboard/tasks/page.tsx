import { TasksPage } from "@/features/tasks/components/tasks-page";
import { getTasksPage } from "@/features/tasks/server/get-tasks-page";
import {
  buildTasksTableHref,
  parseTaskTableSearchParams,
} from "@/features/tasks/task-table-search-params";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";

type DashboardTasksPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardTasksPage({
  params,
  searchParams,
}: DashboardTasksPageProps) {
  const [{ locale }, nextSearchParams] = await Promise.all([params, searchParams]);
  const parsedParams = parseTaskTableSearchParams(nextSearchParams);
  const tasksPage = await getTasksPage(parsedParams);

  if (tasksPage.page !== parsedParams.page) {
    redirectToLocale(
      locale,
      buildTasksTableHref(routes.app.tasks, {
        ...parsedParams,
        page: tasksPage.page,
      }),
    );
  }

  return <TasksPage tasksPage={tasksPage} />;
}

