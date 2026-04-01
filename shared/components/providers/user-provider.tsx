"use client";

import { createContext, useContext } from "react";

import type { SidebarUser } from "@/shared/lib/auth/get-current-user";

const UserContext = createContext<SidebarUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: SidebarUser;
  children: React.ReactNode;
}) {
  return <UserContext value={user}>{children}</UserContext>;
}

export function useUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return user;
}
