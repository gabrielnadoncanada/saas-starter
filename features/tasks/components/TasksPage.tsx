import { SettingsPageHeader } from '@/shared/components/app/SettingsPageHeader';
import { TaskCreateForm } from '@/features/tasks/components/TaskCreateForm';
import { TaskList } from '@/features/tasks/components/TaskList';
import { listCurrentTeamTasks } from '@/features/tasks/server/tasks';

export async function TasksPage() {
  const tasks = await listCurrentTeamTasks();
  const serializedTasks = tasks.map((task) => ({
    ...task,
    updatedAt: task.updatedAt.toISOString()
  }));

  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <SettingsPageHeader title="Tasks" />
      <TaskCreateForm />
      <TaskList tasks={serializedTasks} />
    </section>
  );
}
