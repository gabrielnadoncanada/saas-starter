import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Eyebrow({
  n,
  children,
  className,
}: {
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium text-brand">{n}</span>
      <span className="h-px w-4 bg-muted-foreground/40" />
      <span>{children}</span>
    </div>
  );
}

export function H2({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-balance font-sans text-5xl font-medium leading-[1.05] tracking-[-0.04em]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SerifAccent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-serif italic font-normal text-[#ffc58b]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          fill="none"
          stroke="hsl(var(--brand-hsl))"
          strokeWidth="2"
        />
        <rect x="7" y="7" width="10" height="10" rx="2" fill="hsl(var(--brand-hsl))" />
      </svg>
      <span className="text-base font-semibold tracking-[-0.01em]">tenviq</span>
    </div>
  );
}
