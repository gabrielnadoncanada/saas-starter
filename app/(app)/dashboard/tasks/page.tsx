import { listCurrentTeamTasks } from '@/features/tasks/server/tasks';
import { TasksDialogs } from '@/features/tasks/components/TasksDialogs';
import { TasksPrimaryButtons } from '@/features/tasks/components/TasksPrimaryButtons';
import { TasksTable } from '@/features/tasks/components/TasksTable';
import { TasksProvider } from '@/features/tasks/components/TasksProvider';
import { Main } from '@/shared/components/layout/shell/Main';

export default async function DashboardTasksPage() {
  const tasks = await listCurrentTeamTasks();

  return (
    <TasksProvider initialTasks={tasks}>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable />
      </Main>
      <TasksDialogs />
    </TasksProvider>
  );
}
