import { SettingsPageHeader } from '@/components/shared/SettingsPageHeader';
import { TaskCreateForm } from '@/features/tasks/components/TaskCreateForm';
import { TaskList } from '@/features/tasks/components/TaskList';

export function TasksPage() {
  return (
    <section className="flex-1 space-y-6 p-4 lg:p-8">
      <SettingsPageHeader title="Tasks" />
      <TaskCreateForm />
      <TaskList />
    </section>
  );
}
