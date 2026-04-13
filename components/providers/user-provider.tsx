"use client";

import { createContext, useContext } from "react";

import type { DisplayUser } from "@/lib/auth/get-current-user";

const UserContext = createContext<DisplayUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: DisplayUser;
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
