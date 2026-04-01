import { Building2, LayoutDashboard, Users } from "lucide-react";

import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import { routes } from "@/shared/constants/routes";

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
        {
          title: "Organizations",
          url: routes.admin.organizations,
          icon: Building2,
        },
      ],
    },
  ],
};
