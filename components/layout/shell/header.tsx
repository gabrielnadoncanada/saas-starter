"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

type HeaderProps = {
  children?: React.ReactNode;
};

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-background z-10 flex h-14 w-full items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="relative h-full flex items-center gap-2 px-3">
        <SidebarTrigger variant="outline" />
        {children}
      </div>
    </header>
  );
}
