"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { NavGroup } from "@/components/navigation/nav-group";
import { SidebarGroupSearch } from "@/components/navigation/sidebar-group-search";
import type {
  SidebarData,
  SidebarNavLink,
} from "@/components/navigation/sidebar-types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { accountFlags } from "@/config/account.config";
import { routes } from "@/constants/routes";

const organizationItems: SidebarNavLink[] = [
  ...(accountFlags.enableTeamFeatures
    ? [
        {
          title: "Organization",
          url: routes.settings.organization,
          icon: "building",
        } as const,
        {
          title: "Members",
          url: routes.settings.members,
          icon: "users",
        } as const,
        {
          title: "Activity",
          url: routes.settings.activity,
          icon: "activity",
        } as const,
      ]
    : []),
  {
    title: "Billing",
    url: routes.settings.billing,
    icon: "credit-card",
  },
];

const settingsSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Account",
      items: [
        {
          title: "Profile",
          url: routes.settings.profile,
          icon: "user",
        },
        {
          title: "Preferences",
          url: routes.settings.preferences,
          icon: "palette",
        },
        {
          title: "Security",
          url: routes.settings.security,
          icon: "shield-check",
        },
      ],
    },
    {
      title: accountFlags.enableTeamFeatures ? "Organization" : "Billing",
      items: organizationItems,
    },
  ],
};

export function SettingsSidebar() {
  const groups = settingsSidebarData.navGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton variant="ghost" asChild tooltip="Back to dashboard">
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
        <SidebarGroupSearch />
        {groups.map((group, index) => (
          <NavGroup key={`${group.title}-${index}`} {...group} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
