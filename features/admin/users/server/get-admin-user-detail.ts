import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";

export async function getAdminUserDetail(userId: string) {
  const requestHeaders = await headers();

  const [user, sessions] = await Promise.all([
    auth.api.getUser({
      query: { id: userId },
      headers: requestHeaders,
    }),
    auth.api.listUserSessions({
      body: { userId },
      headers: requestHeaders,
    }),
  ]);

  return { user, sessions };
}
