import Image from "next/image";
import * as React from "react";

import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

export type HeroProps = {
  pill?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  actions: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  /** Mono-style items displayed under the description (stack/specs). */
  stack?: string[];
  /** Wrap the hero image in a faux-browser chrome. Defaults to true. */
  chrome?: boolean;
};

export function Hero({
  pill,
  title,
  description,
  actions,
  imageSrc,
  imageAlt = "Product preview",
  imageWidth = 1920,
  imageHeight = 1200,
  className,
  stack,
  chrome = true,
}: HeroProps) {
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-brand-glow absolute inset-x-0 -top-24 h-[800px]" />
        <div className="bg-grid absolute inset-0 text-foreground opacity-[0.035]" />
        <div className="absolute inset-x-0 top-[600px] h-40 bg-gradient-to-b from-transparent via-background to-background" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 pt-6 text-center">
        {pill ? <div>{pill}</div> : null}

        <div className="space-y-8">
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[88px]">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {actions}

          {stack?.length ? (
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {stack.map((item, i) => (
                <li key={item} className="flex items-center gap-5">
                  {i > 0 ? (
                    <span aria-hidden className="size-1 bg-border" />
                  ) : null}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {imageSrc ? (
        <div className="relative mx-auto mt-20 max-w-[1280px]">
          <div
            aria-hidden
            className="absolute -inset-x-20 -inset-y-10 -z-10 bg-brand-glow opacity-70 blur-3xl"
          />
          <div className="relative overflow-hidden border border-border bg-background shadow-[0_50px_120px_-40px_hsl(var(--brand-hsl)/0.5)]">
            {chrome ? (
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                <span className="ml-3 label-mono">{siteConfig.appDomain}</span>
              </div>
            ) : null}
            <Image
              priority
              src={imageSrc}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="w-full"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-48 dark:bg-gradient-to-t dark:from-background dark:to-transparent"
          />
        </div>
      ) : null}
    </div>
  );
}
