"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { adminSidebarData } from "@/features/admin/config/admin-navigation";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarGroup,
} from "@/shared/components/ui/sidebar";

import { routes } from "@/shared/constants/routes";
import { SidebarGroupSearch } from "@/shared/components/navigation/sidebar-group-search";

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
