import { getCurrentUser } from '@/features/auth/server/current-user';

export async function GET() {
  const user = await getCurrentUser();
  return Response.json(user);
}
