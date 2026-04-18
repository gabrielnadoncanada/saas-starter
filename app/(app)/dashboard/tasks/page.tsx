import { redirect } from "next/navigation";

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { routes } from "@/constants/routes";
import { TasksContent } from "@/features/tasks/components/tasks-content";
import { TasksPageActions } from "@/features/tasks/components/tasks-page-actions";
import { getTasksPage } from "@/features/tasks/server/get-tasks-page";
import {
  buildTasksTableHref,
  parseTaskTableSearchParams,
} from "@/features/tasks/task-table-search-params";

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

  return (
    <Page>
      <PageHeader eyebrow="Organization · Tasks">
        <PageTitle>Tasks</PageTitle>
        <PageDescription>
          Here&apos;s a list of your tasks for this month!
        </PageDescription>
        <PageHeaderActions>
          <TasksPageActions />
        </PageHeaderActions>
      </PageHeader>

      <TasksContent tasksPage={tasksPage} />
    </Page>
  );
}
