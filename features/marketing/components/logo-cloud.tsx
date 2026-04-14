import { cn } from "@/lib/utils";
import * as React from "react";

export type LogoCloudProps = {
  title?: React.ReactNode;
  logos: string[];
  className?: string;
};

export function LogoCloud({ title, logos, className }: LogoCloudProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="text-muted-foreground text-center text-sm font-medium uppercase tracking-[0.2em]">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => (
          <div
            key={logo}
            className="text-center text-muted-foreground flex h-14 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  );
}
