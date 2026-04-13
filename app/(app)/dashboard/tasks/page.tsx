import { TasksPage } from "@/features/tasks/components/tasks-page";
import { listTasks } from "@/features/tasks/server/task-mutations";

export default async function DashboardTasksPage() {
  const tasks = await listTasks();

  return <TasksPage tasks={tasks} />;
}
