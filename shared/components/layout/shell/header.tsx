"use client";

import { SidebarTrigger } from "@/shared/components/ui/sidebar";

type HeaderProps = {
  children: React.ReactNode;
};

export function Header({ children }: HeaderProps) {
  return (
    <header className="z-50 flex items-center gap-2 px-3 pt-2">
      <div className="relative flex h-full items-center gap-3  py-2 sm:gap-4 ">
        <SidebarTrigger variant="outline" />
        {children}
      </div>
    </header>
  );
}
