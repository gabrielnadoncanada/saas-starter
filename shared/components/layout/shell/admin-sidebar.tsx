"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";
import { adminSidebarData } from "@/shared/components/navigation/config/admin-sidebar-data";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import { ArrowLeftIcon } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import Link from "next/link";

export function AdminSidebar() {
  const groups = adminSidebarData.navGroups;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenuButton variant="ghost" asChild>
          <Link
            href={routes.app.dashboard}
            className="justify-start whitespace-nowrap"
          >
            <ArrowLeftIcon className="size-4" />
            Back to dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group, index) => (
          <NavGroup key={`${group.title}-${index}`} {...group} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
