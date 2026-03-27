import {
  CreditCard,
  Users,
  ShieldCheck,
  User,
  Building2,
  Palette,
} from "lucide-react";

import { routes } from "@/shared/constants/routes";
import { accountFlags } from "@/shared/config/account.config";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import type { SidebarNavLink } from "@/shared/components/navigation/sidebar-types";

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

export const settingsSidebarData: SidebarData = {
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
          url: routes.settings.profile,
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
