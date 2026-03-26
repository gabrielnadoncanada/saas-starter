import {
  LayoutDashboard,
  ListTodo,
} from "lucide-react";

import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";

export const dashboardSidebarData: SidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        { title: "Dashboard", url: routes.app.dashboard, icon: LayoutDashboard },
        { title: "Tasks", url: routes.app.tasks, icon: ListTodo },
      ],
    },
  ],
};
