"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

export type SplitShowcaseItem = {
  id: string;
  title: React.ReactNode;
  description: React.ReactNode;
  media: {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string;
    width?: number;
    height?: number;
  };
};

export type SplitShowcaseProps = {
  items?: SplitShowcaseItem[];
  defaultItemId?: string;
  reverse?: boolean;
};

export function SplitShowcase({
  items = [],
  defaultItemId,
  reverse = false,
}: SplitShowcaseProps) {
  const [activeItemId, setActiveItemId] = React.useState(() => {
    const initial = items.find((item) => item.id === defaultItemId) ?? items[0];
    return initial?.id ?? "";
  });

  if (!items.length) return null;

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];
  const activeIndex = items.findIndex((i) => i.id === activeItem.id);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px border border-border bg-border",
        reverse
          ? "md:grid-cols-[2fr_minmax(280px,1fr)] md:[&>*:first-child]:order-2"
          : "md:grid-cols-[minmax(280px,1fr)_2fr]",
      )}
    >
      <div className="flex flex-col bg-background">
        {items.map((item, index) => {
          const isActive = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItemId(item.id)}
              className={cn(
                "group relative flex cursor-pointer flex-col gap-2 border-b border-border px-6 py-5 text-left outline-none transition-colors last:border-b-0",
                isActive ? "bg-brand-soft/40" : "hover:bg-muted/40",
              )}
              aria-pressed={isActive}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-0.5 bg-brand"
                />
              ) : null}

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
                    isActive ? "text-brand" : "text-muted-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  className={cn(
                    "text-base font-semibold tracking-[-0.01em] transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {item.title}
                </h3>
              </div>

              <div
                className={cn(
                  "overflow-hidden pl-7 text-sm leading-relaxed text-muted-foreground transition-all duration-300",
                  isActive
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <p>{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative bg-background p-4 md:p-8">
        <div className="absolute inset-x-8 top-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Preview</span>
          <span className="text-brand">
            {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 -z-0 bg-brand-soft/40 blur-2xl"
        />

        <div className="relative mt-10 border border-border bg-muted/40 shadow-[0_30px_80px_-30px_hsl(var(--brand-hsl)/0.25)]">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-3 py-2">
            <span className="size-2 rounded-full bg-destructive/60" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
          </div>
          <div
            key={activeItem.id}
            className="animate-in fade-in-0 zoom-in-[0.98] block w-full duration-300"
          >
            <ShowcaseMedia item={activeItem} />
          </div>
        </div>

        {items.map((item) => {
          if (item.media.type !== "image") return null;
          return (
            <Image
              key={`${item.id}-preload`}
              aria-hidden="true"
              alt=""
              src={item.media.src}
              width={item.media.width ?? 1600}
              height={item.media.height ?? 1000}
              className="sr-only"
            />
          );
        })}
      </div>
    </div>
  );
}

function ShowcaseMedia({ item }: { item: SplitShowcaseItem }) {
  if (item.media.type === "video") {
    const mime = item.media.src.endsWith(".webm")
      ? "video/webm"
      : item.media.src.endsWith(".mov")
        ? "video/quicktime"
        : "video/mp4";
    return (
      <video
        key={item.media.src}
        className="block w-full"
        width={item.media.width ?? 1600}
        height={item.media.height ?? 1000}
        playsInline
        autoPlay
        muted
        loop
        preload="auto"
        poster={item.media.poster}
      >
        <source src={item.media.src} type={mime} />
      </video>
    );
  }

  return (
    <Image
      key={item.media.src}
      src={item.media.src}
      alt={item.media.alt ?? "Showcase image"}
      width={item.media.width ?? 1600}
      height={item.media.height ?? 1000}
      className="block w-full"
    />
  );
}
