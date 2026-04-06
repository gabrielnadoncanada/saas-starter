"use client";

import { Building2, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { authClient } from "@/shared/lib/auth/auth-client";

type OrganizationSwitcherProps = {
  onCreateWorkspace: () => void;
};

export function OrganizationSwitcher({
  onCreateWorkspace,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const { data: organizationsData, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations();

  const organizations = organizationsData ?? [];

  const { data: activeOrganization, isPending: isLoadingActiveOrganization } =
    authClient.useActiveOrganization();

  const isLoading =
    isLoadingOrganizations || isLoadingActiveOrganization || isSwitching;

  async function switchOrganization(organizationId: string) {
    if (!organizationId || organizationId === activeOrganization?.id) {
      return;
    }

    try {
      setIsSwitching(true);

      const { error } = await authClient.organization.setActive({
        organizationId,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to switch workspace",
      );
    } finally {
      setIsSwitching(false);
    }
  }

  if (isLoading || organizations.length === 0) {
    return null;
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Building2 className="size-4" />
          <span>Switch workspace</span>
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {organizations.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => {
                  void switchOrganization(organization.id);
                }}
              >
                <div className="flex size-5 items-center justify-center rounded-sm border">
                  <span className="text-xs font-semibold">
                    {organization.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {organization.name}

                {organization.id === activeOrganization?.id && (
                  <Check className="ms-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onCreateWorkspace}>
              <Plus className="size-4" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
}
