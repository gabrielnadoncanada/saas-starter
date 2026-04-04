"use client";

import { ChevronsUpDown, Cog, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { SignOutDialog } from "@/features/auth/components/session/sign-out-dialog";
import { OrganizationSwitcher } from "@/features/organizations/components/organization-switcher";
import { useUser } from "@/shared/components/providers/user-provider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { accountFlags } from "@/shared/config/account.config";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";
import { authClient } from "@/shared/lib/auth/auth-client";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";

export function DashboardSidebarUser() {
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);
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
              <SidebarMenuButton variant="outline" size="lg">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {activeOrganization?.name?.charAt(0).toUpperCase() ?? "O"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrganization?.name ?? "Organization"}
                  </span>
                  <span className="truncate text-xs">
                    {accountFlags.enableTeamFeatures
                      ? "Organization"
                      : "Account"}
                  </span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
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
                  <OrganizationSwitcher />
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
    </>
  );
}

