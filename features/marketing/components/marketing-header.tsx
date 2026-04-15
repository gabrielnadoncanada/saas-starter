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
        "fixed w-full  top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl",
        className,
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/" className="group relative flex shrink-0 items-center">
          {logo}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <Button
            asChild
            variant="ghost"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Link href={signInHref}>Sign in</Link>
          </Button>
          <Link
            href={signUpHref}
            className="group relative inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Get the starter
            <span className="text-brand transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
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

              <nav className="flex flex-col gap-4 px-6">
                {links.map((link) => (
                  <DrawerClose key={link.href} asChild>
                    <Link href={link.href} className="text-lg font-medium">
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
                    <Button
                      asChild
                      className="bg-brand text-brand-foreground hover:bg-brand/90"
                    >
                      <Link href={signUpHref}>Get the starter</Link>
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
