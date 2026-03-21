"use client";

import { useState } from "react";
import { authClient } from "@/shared/lib/auth/auth-client";

type RejectOrganizationInvitationParams = {
  invitationId: string;
};

export async function rejectOrganizationInvitation(
  params: RejectOrganizationInvitationParams,
) {
  const { data, error } = await authClient.organization.rejectInvitation({
    invitationId: params.invitationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useRejectOrganizationInvitation() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function mutate(params: RejectOrganizationInvitationParams) {
    try {
      setIsPending(true);
      setError(null);
      return await rejectOrganizationInvitation(params);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to decline invitation";

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
