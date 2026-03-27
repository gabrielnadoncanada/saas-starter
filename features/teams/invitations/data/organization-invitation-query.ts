"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/shared/lib/auth/auth-client";

export async function getOrganizationInvitation(invitationId: string) {
  const { data, error } = await authClient.organization.getInvitation({
    query: { id: invitationId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export type OrganizationInvitation = Awaited<
  ReturnType<typeof getOrganizationInvitation>
>;

export function useOrganizationInvitation(invitationId: string) {
  const [data, setData] = useState<OrganizationInvitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadInvitation() {
      try {
        setIsPending(true);
        setError(null);

        const invitation = await getOrganizationInvitation(invitationId);

        if (!isCancelled) {
          setData(invitation);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load invitation",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsPending(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      isCancelled = true;
    };
  }, [invitationId]);

  return {
    data,
    error,
    isPending,
  };
}
