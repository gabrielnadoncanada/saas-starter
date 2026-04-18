import { LayoutDashboard, ListTodo, MessageSquarePlus } from "lucide-react";

import type { SidebarData } from "@/components/navigation/sidebar-types";
import { routes } from "@/constants/routes";

type DashboardSidebarFlags = {
  assistantEnabled: boolean;
};

export function getDashboardSidebarData({
  assistantEnabled,
}: DashboardSidebarFlags): SidebarData {
  return {
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
          ...(assistantEnabled
            ? [
                {
                  title: "Assistant",
                  url: routes.app.assistant,
                  icon: MessageSquarePlus,
                },
              ]
            : []),
        ],
      },
    ],
  };
}
