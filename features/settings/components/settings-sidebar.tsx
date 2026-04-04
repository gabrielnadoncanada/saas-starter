"use client";

import { ArrowLeftIcon } from "lucide-react";

import { settingsSidebarData } from "@/features/settings/config/settings-navigation";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";
import { routes } from "@/shared/constants/routes";
import { Link } from "@/shared/i18n/navigation";

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

