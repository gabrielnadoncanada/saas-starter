import { Building2, LayoutDashboard, Users } from "lucide-react";

import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";

export const adminSidebarData: SidebarData = {
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
        { title: "Organizations", url: routes.admin.organizations, icon: Building2 },
      ],
    },
  ],
};
