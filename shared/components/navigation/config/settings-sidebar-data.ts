import {
  CreditCard,
  Users,
  ShieldCheck,
  User,
  Building2,
  Palette,
} from "lucide-react";

import { routes } from "@/shared/constants/routes";
import type { SidebarData } from "@/shared/components/navigation/sidebar-types";

export const settingsSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Your Account",
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
          url: routes.settings.authentication,
          icon: ShieldCheck,
        }
      ],
    },
    {
      title: "Your Account",
      items: [
        {
          title: "Organization",
          url: routes.settings.organization,
          icon: Building2,
        },
        {
          title: "Members",
          url: routes.settings.authentication,
          icon: Users,
        },
        {
          title: "Billing",
          url: routes.settings.billing,
          icon: CreditCard,
        },
      ],
    },
  ],
};
