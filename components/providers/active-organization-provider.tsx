"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth/auth-client";

export function ActiveOrganizationProvider({
  organizationId,
  children,
}: {
  organizationId: string | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!organizationId) {
      return;
    }

    authClient.organization.setActive({
      organizationId,
    });
  }, [organizationId]);

  return <>{children}</>;
}
