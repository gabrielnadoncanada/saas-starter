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
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";

type OrganizationSwitcherProps = {
  onCreateOrganization: () => void;
};

export function OrganizationSwitcher({
  onCreateOrganization,
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
        error instanceof Error ? error.message : "Failed to switch organization",
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
          <span>Switch organization</span>
        </DropdownMenuSubTrigger>

        <DropdownMenuPortal>
          <DropdownMenuSubContent
            collisionPadding={8}
            className="max-w-[calc(100vw-1rem)]"
          >
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

            <DropdownMenuItem onClick={onCreateOrganization}>
              <Plus className="size-4" />
              Create organization
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
}
