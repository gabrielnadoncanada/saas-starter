"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export type MarketingLink = {
  label: string;
  href: string;
};

export type MarketingHeaderProps = {
  logo: React.ReactNode;
  links: MarketingLink[];
  signInHref: string;
  signUpHref: string;
  className?: string;
};

export function MarketingHeader({
  logo,
  links,
  signInHref,
  signUpHref,
  className,
}: MarketingHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur",
        className,
      )}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          {logo}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link href={signInHref}>Sign In</Link>
          </Button>
          <Button asChild>
            <Link href={signUpHref}>Sign Up</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="flex flex-col gap-6">
              <DrawerHeader className="hidden">
                <DrawerTitle>Navigation menu</DrawerTitle>
                <DrawerDescription>
                  Browse the marketing pages and account links.
                </DrawerDescription>
              </DrawerHeader>

              <nav className="flex flex-col gap-4 px-4">
                {links.map((link) => (
                  <DrawerClose key={link.href} asChild>
                    <Link href={link.href} className="text-sm font-medium">
                      {link.label}
                    </Link>
                  </DrawerClose>
                ))}
              </nav>

              <DrawerFooter>
                <div className="flex flex-col gap-2">
                  <DrawerClose asChild>
                    <Button asChild variant="outline">
                      <Link href={signInHref}>Sign In</Link>
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button asChild>
                      <Link href={signUpHref}>Sign Up</Link>
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
