import { getCurrentUser } from '@/features/auth/lib/current-user';

export async function GET() {
  const user = await getCurrentUser();
  return Response.json(user);
}
