import { getCurrentTeam } from '@/features/team/lib/current-team';

export async function GET() {
  const team = await getCurrentTeam();
  return Response.json(team);
}
