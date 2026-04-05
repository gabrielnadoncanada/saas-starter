"use client";

import {
  Building2,
  CreditCard,
  ArrowLeftIcon,
  Palette,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

import { NavGroup } from "@/shared/components/navigation/nav-group";
import type {
  SidebarData,
  SidebarNavLink,
} from "@/shared/components/navigation/sidebar-types";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
} from "@/shared/components/ui/sidebar";
import { accountFlags } from "@/shared/config/account.config";
import { routes } from "@/shared/constants/routes";

const workspaceItems: SidebarNavLink[] = [
  ...(accountFlags.enableTeamFeatures
    ? [
        {
          title: "Organization",
          url: routes.settings.organization,
          icon: Building2,
        },
        {
          title: "Members",
          url: routes.settings.members,
          icon: Users,
        },
      ]
    : []),
  {
    title: "Billing",
    url: routes.settings.billing,
    icon: CreditCard,
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
          icon: User,
        },
        {
          title: "Preferences",
          url: routes.settings.preferences,
          icon: Palette,
        },
        {
          title: "Security",
          url: routes.settings.security,
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: accountFlags.enableTeamFeatures ? "Workspace" : "Billing",
      items: workspaceItems,
    },
  ],
};

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
