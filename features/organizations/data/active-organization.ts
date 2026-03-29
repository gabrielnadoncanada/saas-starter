import { authClient } from "@/shared/lib/auth/auth-client";

export async function getActiveOrganization() {
  const { data, error } = authClient.useActiveOrganization();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export type ActiveOrganization = Awaited<
  ReturnType<typeof getActiveOrganization>
>;

export function useActiveOrganization() {
  return authClient.useActiveOrganization();
}
