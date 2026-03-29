import { listCurrentOrganizationTasks } from "@/features/tasks/server/tasks";
import { TasksPrimaryButtons } from "@/features/tasks/components/tasks-primary-buttons";
import { TasksDialogs } from "@/features/tasks/components/dialogs/tasks-dialogs";
import { TasksTable } from "@/features/tasks/components/table/tasks-table";
import { TasksProvider } from "@/features/tasks/state/tasks-provider";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/shared/components/layout/page";

export default async function DashboardTasksPage() {
  const tasks = await listCurrentOrganizationTasks();

  return (
    <TasksProvider initialTasks={tasks}>
      <Page>
        <PageHeader>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>
            Here&apos;s a list of your tasks for this month!
          </PageDescription>
          <PageHeaderActions>
            <TasksPrimaryButtons />
          </PageHeaderActions>
        </PageHeader>
        <TasksTable />
      </Page>
      <TasksDialogs />
    </TasksProvider>
  );
}

