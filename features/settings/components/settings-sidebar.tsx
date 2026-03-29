"use client";

import { settingsSidebarData } from "@/features/settings/config/settings-navigation";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import { routes } from "@/shared/constants/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export function SettingsSidebar() {
  const groups = settingsSidebarData.navGroups;

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
