"use client";

import {
  ChevronsUpDown,
  Cog,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useUser } from "@/components/providers/user-provider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { accountFlags } from "@/config/account.config";
import { routes } from "@/constants/routes";
import { SignOutDialog } from "@/features/auth/components/sign-out-dialog";
import { CreateOrganizationDialog } from "@/features/organizations/components/create-organization-dialog";
import { OrganizationSwitcher } from "@/features/organizations/components/organization-switcher";
import { authClient } from "@/lib/auth/auth-client";
import { isPlatformAdmin } from "@/lib/auth/roles";

export function DashboardSidebarUser() {
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const user = useUser();
  const { data: organizationsData } = authClient.useListOrganizations();
  const organizations = organizationsData ?? [];
  const { data: activeOrganizationData } = authClient.useActiveOrganization();
  const activeOrganization = activeOrganizationData ?? organizations[0];
  const userInitials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton variant="ghost">
                <div className="font-semibold flex items-center justify-center w-4 h-4 min-w-4">
                  {activeOrganization?.name?.charAt(0).toUpperCase() ?? "O"}
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrganization?.name ?? "Organization"}
                  </span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              side={state === "collapsed" ? "right" : "bottom"}
              align={state === "collapsed" ? "start" : "end"}
              alignOffset={state === "collapsed" ? -8 : 0}
              sideOffset={state === "collapsed" ? 12 : 4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accountFlags.showOrgSwitcher && (
                <>
                  <OrganizationSwitcher
                    onCreateOrganization={() => setShowCreateOrg(true)}
                  />
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={routes.settings.profile}>
                    <Cog />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {isPlatformAdmin(user.role) && (
                  <DropdownMenuItem asChild>
                    <Link href={routes.admin.dashboard}>
                      <ShieldCheck />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={open} onOpenChange={setOpen} />
      <CreateOrganizationDialog
        open={showCreateOrg}
        onOpenChange={setShowCreateOrg}
      />
    </>
  );
}
