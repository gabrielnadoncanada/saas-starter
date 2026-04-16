import * as React from "react";

import { cn } from "@/lib/utils";

export type LogoCloudProps = {
  title?: React.ReactNode;
  logos: string[];
  className?: string;
};

export function LogoCloud({ title, logos, className }: LogoCloudProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {title ? (
        <div className="flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-px w-8 bg-border" aria-hidden />
          <span>{title}</span>
          <span className="h-px w-8 bg-border" aria-hidden />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo, i) => (
          <div
            key={logo}
            className="group relative flex h-16 items-center justify-center bg-background px-4 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ml-3 max-w-[16ch]">{logo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
