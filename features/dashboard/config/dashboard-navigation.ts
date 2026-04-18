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
            icon: "layout-dashboard",
          },
          { title: "Tasks", url: routes.app.tasks, icon: "list-todo" },
          ...(assistantEnabled
            ? [
                {
                  title: "Assistant",
                  url: routes.app.assistant,
                  icon: "message-square-plus" as const,
                },
              ]
            : []),
        ],
      },
    ],
  };
}
