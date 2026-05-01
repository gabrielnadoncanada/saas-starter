"use client";

import {
  Activity,
  Building2,
  CreditCard,
  Inbox,
  LayoutDashboard,
  ListTodo,
  type LucideIcon,
  type LucideProps,
  MessageSquarePlus,
  Palette,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

const sidebarIcons = {
  activity: Activity,
  building: Building2,
  "credit-card": CreditCard,
  inbox: Inbox,
  "layout-dashboard": LayoutDashboard,
  "list-todo": ListTodo,
  "message-square-plus": MessageSquarePlus,
  palette: Palette,
  "shield-check": ShieldCheck,
  user: User,
  users: Users,
} as const satisfies Record<string, LucideIcon>;

export type SidebarIconName = keyof typeof sidebarIcons;

export function SidebarIcon({
  name,
  ...props
}: LucideProps & { name: SidebarIconName }) {
  const Icon = sidebarIcons[name];
  return <Icon {...props} />;
}
