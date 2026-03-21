import { authClient } from "@/shared/lib/auth/auth-client";

export async function listOrganizations() {
  const { data, error } = await authClient.useListOrganizations();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export type OrganizationList = Awaited<ReturnType<typeof listOrganizations>>;
export type OrganizationListItem = OrganizationList[number];

export function useOrganizationList() {
  return authClient.useListOrganizations();
}
