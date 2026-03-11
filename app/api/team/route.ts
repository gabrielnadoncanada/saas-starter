import { getCurrentTeam } from '@/features/team/server/current-team';

export async function GET() {
  const team = await getCurrentTeam();
  return Response.json(team);
}
