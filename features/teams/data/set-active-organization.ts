"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";

type SetActiveOrganizationParams = {
  organizationId: string;
};

export async function setActiveOrganization(
  params: SetActiveOrganizationParams,
) {
  const { data, error } = await authClient.organization.setActive({
    organizationId: params.organizationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useSetActiveOrganization() {
  const [isPending, setIsPending] = useState(false);

  async function mutate(params: SetActiveOrganizationParams) {
    try {
      setIsPending(true);
      return await setActiveOrganization(params);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to switch organization";

      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  }

  return {
    isPending,
    mutate,
  };
}
