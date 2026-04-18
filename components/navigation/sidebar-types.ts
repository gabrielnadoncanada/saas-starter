import type { SidebarIconName } from "@/components/navigation/sidebar-icon";

type SidebarBaseItem = {
  title: string;
  badge?: string;
  icon?: SidebarIconName;
};

export type SidebarNavLink = SidebarBaseItem & {
  url: string;
  items?: never;
};

export type SidebarNavCollapsible = SidebarBaseItem & {
  items: (SidebarBaseItem & { url: string })[];
  url?: never;
};

export type SidebarNavItem = SidebarNavCollapsible | SidebarNavLink;

export type SidebarNavGroup = {
  title: string;
  items: SidebarNavItem[];
};

export type SidebarData = {
  navGroups: SidebarNavGroup[];
};
