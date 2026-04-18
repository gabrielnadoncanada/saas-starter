"use client";

import {
  Activity,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListTodo,
  MessageSquarePlus,
  Palette,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const sidebarIcons = {
  activity: Activity,
  building: Building2,
  "credit-card": CreditCard,
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
