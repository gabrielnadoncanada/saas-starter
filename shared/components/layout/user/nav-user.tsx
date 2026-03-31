"use client";

import {
  Building2,
  Check,
  ChevronsUpDown,
  Cog,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useActiveOrganization } from "@/features/organizations/data/active-organization";
import { useOrganizationList } from "@/features/organizations/data/organization-list";
import { useSetActiveOrganization } from "@/features/organizations/data/set-active-organization";
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import Link from "next/link";
import { routes } from "@/shared/constants/routes";
import { accountFlags } from "@/shared/config/account.config";
import { SignOutDialog } from "@/features/auth/components/session/sign-out-dialog";
import { isPlatformAdmin } from "@/shared/lib/auth/roles";
import { useUser } from "@/shared/components/providers/user-provider";

export function NavUser() {
  const router = useRouter();
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);
  const user = useUser();
  const { data: organizations } = useOrganizationList();
  const { data: activeOrganization } = useActiveOrganization();
  const setActiveOrganization = useSetActiveOrganization();
  const orgItems = organizations ?? [];
  const currentOrg = activeOrganization ?? orgItems[0];
  const currentOrgName = currentOrg?.name ?? "Organization";
  const currentOrgInitial = currentOrgName.charAt(0).toUpperCase();
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
                    {currentOrgInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentOrgName}
                  </span>
                  <span className="truncate text-xs">
                    {accountFlags.enableTeamFeatures ? "Organization" : "Account"}
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
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Building2 />
                        Switch workspace
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {orgItems.map((org) => (
                            <DropdownMenuItem
                              key={org.id}
                              onClick={async () => {
                                if (org.id !== activeOrganization?.id) {
                                  await setActiveOrganization.mutate({
                                    organizationId: org.id,
                                  });
                                  router.refresh();
                                }
                              }}
                            >
                              <div className="flex size-5 items-center justify-center rounded-sm border">
                                <span className="text-xs font-semibold">
                                  {org.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {org.name}
                              {org.id === activeOrganization?.id && (
                                <Check className="ms-auto size-4" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
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


