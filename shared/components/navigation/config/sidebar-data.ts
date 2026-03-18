import {
  LayoutDashboard,
  ListTodo,
  Sparkles,
} from "lucide-react";

import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import { settingsGroup } from "./settings-group";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "General",
      items: [
        { title: "Dashboard", url: routes.app.dashboard, icon: LayoutDashboard },
        { title: "Tasks", url: routes.app.tasks, icon: ListTodo },
        { title: "AI Assistant", url: routes.app.assistant, icon: Sparkles },
      ],
    },
    settingsGroup,
  ],
};
