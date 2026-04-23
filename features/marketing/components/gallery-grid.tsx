"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  type GalleryShot,
  useShotSrc,
} from "@/features/marketing/components/gallery-lightbox";

export type GalleryGridProps = {
  shots: GalleryShot[];
  onOpen: (index: number) => void;
  className?: string;
};

export function GalleryGrid({ shots, onOpen, className }: GalleryGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3",
        className,
      )}
    >
      {shots.map((shot, index) => (
        <GalleryShotCard
          key={shot.id}
          shot={shot}
          onOpen={() => onOpen(index)}
        />
      ))}
    </div>
  );
}

function GalleryShotCard({
  shot,
  onOpen,
}: {
  shot: GalleryShot;
  onOpen: () => void;
}) {
  const resolvedSrc = useShotSrc(shot);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${shot.caption} in full screen`}
      className={cn(
        "group relative block overflow-hidden rounded-xl border border-border/60 bg-card text-left",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]",
        "transition duration-500 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_24px_48px_-16px_rgba(0,0,0,0.2)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
        <Image
          src={resolvedSrc}
          alt={shot.alt}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 92vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-90"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <span className="truncate text-sm font-medium tracking-tight text-foreground">
          {shot.caption}
        </span>
        <span
          aria-hidden
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-brand"
        >
          View
        </span>
      </div>
    </button>
  );
}
