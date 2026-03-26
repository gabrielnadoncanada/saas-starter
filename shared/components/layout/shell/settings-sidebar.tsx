"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar";
import { settingsSidebarData } from "@/shared/components/navigation/config/settings-sidebar-data";
import { NavGroup } from "@/shared/components/navigation/nav-group";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { routes } from "@/shared/constants/routes";
import Link from "next/link";

export function SettingsSidebar() {
  const groups = settingsSidebarData.navGroups;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <Button variant="ghost" asChild>
          <Link href={routes.app.dashboard} className="justify-start">
            <ArrowLeftIcon className="size-4" />
            Back to dashboard
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup {...groups[0]} />
      </SidebarContent>
    </Sidebar>
  );
}
