import { getCurrentUser } from '@/lib/auth/get-current-user';

export async function GET() {
  const user = await getCurrentUser();
  return Response.json(user);
}
