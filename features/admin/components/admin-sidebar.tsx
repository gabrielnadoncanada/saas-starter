"use client";

import { ArrowLeftIcon, Building2, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";

import { NavGroup } from "@/shared/components/navigation/nav-group";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";

import { routes } from "@/shared/constants/routes";
import { SidebarGroupSearch } from "@/shared/components/navigation/sidebar-group-search";

const adminSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Administration",
      items: [
        {
          title: "Overview",
          url: routes.admin.dashboard,
          icon: LayoutDashboard,
        },
        { title: "Users", url: routes.admin.users, icon: Users },
        {
          title: "Organizations",
          url: routes.admin.organizations,
          icon: Building2,
        },
      ],
    },
  ],
};

export function AdminSidebar() {
  const groups = adminSidebarData.navGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton variant="ghost" asChild tooltip="Back">
          <Link
            href={routes.app.dashboard}
            className="justify-start whitespace-nowrap"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupSearch />
        {groups.map((group, index) => (
          <NavGroup key={`${group.title}-${index}`} {...group} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
