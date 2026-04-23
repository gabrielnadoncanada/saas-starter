"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type GalleryShot = {
  id: string;
  caption: string;
  alt: string;
  src: string;
  srcLight?: string;
  width?: number;
  height?: number;
};

export function useShotSrc(shot: GalleryShot) {
  const { resolvedTheme } = useTheme();
  if (resolvedTheme === "light" && shot.srcLight) return shot.srcLight;
  return shot.src;
}

export type GalleryLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shots: GalleryShot[];
  index: number;
  onIndexChange: (index: number) => void;
  label?: string;
};

export function GalleryLightbox({
  open,
  onOpenChange,
  shots,
  index,
  onIndexChange,
  label,
}: GalleryLightboxProps) {
  const shot = shots[index];
  const total = shots.length;

  const next = React.useCallback(() => {
    if (total === 0) return;
    onIndexChange((index + 1) % total);
  }, [index, onIndexChange, total]);

  const prev = React.useCallback(() => {
    if (total === 0) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, onIndexChange, total]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col outline-none",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {shot?.caption ?? "Screenshot preview"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Use left and right arrow keys to navigate. Press Escape to close.
          </DialogPrimitive.Description>

          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-6 py-4 text-white md:px-10">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
              <span className="size-1.5 bg-brand" aria-hidden />
              {label ? <span className="text-white/80">{label}</span> : null}
              {label ? (
                <span aria-hidden className="h-px w-10 bg-white/20" />
              ) : null}
              <span className="tabular-nums">
                {total > 0
                  ? `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
                  : "00 / 00"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={total < 2}
                aria-label="Previous screenshot"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={total < 2}
                aria-label="Next screenshot"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
              <span aria-hidden className="mx-1 h-5 w-px bg-white/15" />
              <DialogPrimitive.Close
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
          </header>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-10">
            {total > 1 ? (
              <button
                type="button"
                onClick={prev}
                aria-label="Previous screenshot"
                className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 p-3 text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white md:inline-flex"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            {shot ? <LightboxFigure shot={shot} /> : null}

            {total > 1 ? (
              <button
                type="button"
                onClick={next}
                aria-label="Next screenshot"
                className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 p-3 text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white md:inline-flex"
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>

          {total > 1 ? (
            <div className="shrink-0 border-t border-white/10 bg-black/40 px-4 py-3 md:px-10">
              <ScrollArea>
                <div className="flex gap-2">
                  {shots.map((s, i) => (
                    <LightboxThumb
                      key={s.id}
                      shot={s}
                      selected={i === index}
                      onClick={() => onIndexChange(i)}
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function LightboxFigure({ shot }: { shot: GalleryShot }) {
  const resolvedSrc = useShotSrc(shot);
  return (
    <figure className="relative flex h-full w-full max-w-[1400px] flex-col items-center justify-center">
      <div className="relative w-full max-h-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
        <Image
          key={shot.id}
          src={resolvedSrc}
          alt={shot.alt}
          width={shot.width ?? 2400}
          height={shot.height ?? 1500}
          className="h-auto w-full object-contain"
          priority
        />
      </div>
      <figcaption className="mt-4 text-center text-sm text-white/70">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

function LightboxThumb({
  shot,
  selected,
  onClick,
}: {
  shot: GalleryShot;
  selected: boolean;
  onClick: () => void;
}) {
  const resolvedSrc = useShotSrc(shot);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Go to ${shot.caption}`}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "relative h-14 w-24 shrink-0 overflow-hidden rounded-md border transition",
        selected
          ? "border-brand ring-2 ring-brand/60 ring-offset-2 ring-offset-black"
          : "border-white/10 opacity-60 hover:opacity-100",
      )}
    >
      <Image
        src={resolvedSrc}
        alt=""
        fill
        sizes="96px"
        className="object-cover object-top"
      />
    </button>
  );
}
