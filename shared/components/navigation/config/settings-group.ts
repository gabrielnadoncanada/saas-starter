import { Activity, Settings, ShieldCheck, UserCog, Users } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";
import { terminology } from "@/shared/constants/terminology";

export const settingsGroup: SidebarData["navGroups"][number] = {
  title: "Other",
  items: [
    {
      title: "Settings",
      icon: Settings,
      items: [
        {
          title: "Account",
          url: routes.app.settingsAccount,
          icon: UserCog,
        },
        {
          title: "Authentication",
          url: routes.app.settingsAuthentication,
          icon: ShieldCheck,
        },
        {
          title: "Activity",
          url: routes.app.settingsActivityLog,
          icon: Activity,
        },
        {
          title: terminology.Singular,
          url: routes.app.settingsTeam,
          icon: Users,
        },
      ],
    },
  ],
};
