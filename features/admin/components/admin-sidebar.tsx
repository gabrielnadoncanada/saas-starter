"use client";

import { ArrowLeftIcon, Building2, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";

import { NavGroup } from "@/components/navigation/nav-group";
import { SidebarGroupSearch } from "@/components/navigation/sidebar-group-search";
import type { SidebarData } from "@/components/navigation/sidebar-types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { routes } from "@/constants/routes";

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
