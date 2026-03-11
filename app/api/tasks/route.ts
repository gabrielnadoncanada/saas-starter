import { listCurrentTeamTasks } from '@/features/tasks/server/tasks';

function getStatus(error: unknown) {
  if (error instanceof Error && error.message === 'User is not authenticated') {
    return 401;
  }

  if (error instanceof Error && error.message === 'User is not part of a team') {
    return 403;
  }

  return 500;
}

export async function GET() {
  try {
    const tasks = await listCurrentTeamTasks();
    return Response.json(tasks);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, {
      status: getStatus(error)
    });
  }
}
