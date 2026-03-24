import { Settings, ShieldCheck } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";

export const settingsGroup: SidebarData["navGroups"][number] = {
  title: "Other",
  items: [
    {
      title: "Settings",
      icon: Settings,
      items: [
        {
          title: "Authentication",
          url: routes.app.settingsAuthentication,
          icon: ShieldCheck,
        },
      ],
    },
  ],
};
