import { listCurrentOrganizationTasks } from "@/features/tasks/server/tasks";
import { TasksPageClient } from "@/features/tasks/components/tasks-page-client";

export default async function DashboardTasksPage() {
  const tasks = await listCurrentOrganizationTasks();

  return <TasksPageClient initialTasks={tasks} />;
}

