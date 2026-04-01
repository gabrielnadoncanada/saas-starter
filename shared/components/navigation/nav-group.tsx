"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import {
  type SidebarNavCollapsible,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarNavLink,
} from "@/shared/components/navigation/sidebar-types";
import { Badge } from "@/shared/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";

export function NavGroup({
  title,
  items,
  children,
}: SidebarNavGroup & { children?: ReactNode }) {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const isCollapsedDesktop = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const key = item.url
            ? `${item.title}-${item.url}`
            : `${item.title}-group`;

          if (!item.items) {
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );
          }

          return isCollapsedDesktop ? (
            <SidebarMenuCollapsedDropdown
              key={key}
              item={item}
              pathname={pathname}
            />
          ) : (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}

        {children}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}

function SidebarMenuLink({
  item,
  pathname,
}: {
  item: SidebarNavLink;
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isItemActive(pathname, item)}
        tooltip={item.title}
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: SidebarNavCollapsible;
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Collapsible
      asChild
      defaultOpen={isCollapsibleOpen(pathname, item)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.filter(hasUrl).map((subItem) => (
              <SidebarMenuSubItem key={`${subItem.title}-${subItem.url}`}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isItemActive(pathname, subItem)}
                >
                  <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: SidebarNavCollapsible;
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isItemActive(pathname, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {item.items.filter(hasUrl).map((subItem) => (
            <DropdownMenuItem key={`${subItem.title}-${subItem.url}`} asChild>
              <Link
                href={subItem.url}
                onClick={() => setOpenMobile(false)}
                className={
                  isItemActive(pathname, subItem) ? "bg-secondary" : undefined
                }
              >
                {subItem.icon && <subItem.icon />}
                <span className="max-w-52 text-wrap">{subItem.title}</span>
                {subItem.badge && (
                  <span className="ms-auto text-xs">{subItem.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function hasUrl(item: SidebarNavItem): item is SidebarNavLink {
  return typeof item.url === "string" && item.url.length > 0;
}

function normalizePath(pathname: string) {
  return pathname.split("?")[0];
}

function isItemActive(pathname: string, item: SidebarNavItem) {
  const path = normalizePath(pathname);

  if (item.url && path === item.url) return true;
  if (item.items?.some((subItem) => path === subItem.url)) return true;

  return false;
}

function isCollapsibleOpen(pathname: string, item: SidebarNavCollapsible) {
  const path = normalizePath(pathname);

  return item.items.some(
    (subItem) => subItem.url && path.startsWith(subItem.url),
  );
}
