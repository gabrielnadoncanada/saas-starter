"use client";

import { useState } from "react";
import { authClient } from "@/shared/lib/auth/auth-client";

type AcceptOrganizationInvitationParams = {
  invitationId: string;
};

export async function acceptOrganizationInvitation(
  params: AcceptOrganizationInvitationParams,
) {
  const { data, error } = await authClient.organization.acceptInvitation({
    invitationId: params.invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useAcceptOrganizationInvitation() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function mutate(params: AcceptOrganizationInvitationParams) {
    try {
      setIsPending(true);
      setError(null);
      return await acceptOrganizationInvitation(params);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to accept invitation";

      setError(message);
      throw mutationError;
    } finally {
      setIsPending(false);
    }
  }

  return {
    error,
    isPending,
    mutate,
  };
}
