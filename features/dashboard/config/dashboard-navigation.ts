import { LayoutDashboard, ListTodo, MessageSquarePlus } from "lucide-react";

import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import { routes } from "@/shared/constants/routes";

export const dashboardSidebarData: SidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: routes.app.dashboard,
          icon: LayoutDashboard,
        },
        { title: "Tasks", url: routes.app.tasks, icon: ListTodo },
        { title: "Assistant", url: routes.app.assistant, icon: MessageSquarePlus }, 
      ],
    },
  ],
};
