"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function useShotSrc(shot: GalleryShot) {
  const { resolvedTheme } = useTheme();
  if (resolvedTheme === "light" && shot.srcLight) return shot.srcLight;
  return shot.src;
}

export type GalleryCategory = {
  id: string;
  label: string;
  note?: string;
  shots: GalleryShot[];
  footer?: React.ReactNode;
};

export type ScreenshotGalleryProps = {
  categories: GalleryCategory[];
  defaultCategoryId?: string;
  /** Top offset for sticky tabs header. Matches marketing header height. */
  stickyTop?: string;
  className?: string;
};

export function ScreenshotGallery({
  categories,
  defaultCategoryId,
  stickyTop = "top-16",
  className,
}: ScreenshotGalleryProps) {
  const [active, setActive] = React.useState(
    defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [lightbox, setLightbox] = React.useState<{
    categoryId: string;
    index: number;
  } | null>(null);
  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const didMount = React.useRef(false);

  const activeCategory = categories.find((c) => c.id === active);

  const openLightbox = React.useCallback(
    (index: number) => {
      if (!activeCategory) return;
      setLightbox({ categoryId: activeCategory.id, index });
    },
    [activeCategory],
  );

  const handleTabChange = React.useCallback((value: string) => {
    setActive(value);
    // Skip scroll on initial mount; only scroll on real user tab change.
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  React.useEffect(() => {
    didMount.current = true;
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={active} onValueChange={handleTabChange}>
        <div
          className={cn(
            "sticky z-30 -mx-6 md:-mx-10 border-y border-border/70 bg-background/80 backdrop-blur-xl",
            stickyTop,
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 md:px-10">
            <span className="label-mono hidden shrink-0 items-center gap-2 md:inline-flex">
              <span aria-hidden className="size-1.5 bg-brand" />
              Screenshots
            </span>

            <div className="flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList
                variant="line"
                className="h-14 gap-0 border-none bg-transparent px-0"
              >
                {categories.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.id}
                    className="h-full rounded-none px-5 text-[13px] font-medium tracking-tight"
                  >
                    {c.label}
                    <span
                      aria-hidden
                      className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground/80"
                    >
                      {String(c.shots.length).padStart(2, "0")}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>

        <div ref={scrollAnchorRef} aria-hidden className="scroll-mt-[120px]" />

        {categories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="relative -mx-6 md:-mx-10"
          >
            <div
              aria-hidden
              className="bg-grid pointer-events-none absolute inset-0 opacity-[0.05] text-foreground"
            />
            <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-16">
              {category.note ? (
                <p className="mb-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {category.note}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
                {category.shots.map((shot, index) => (
                  <GalleryShotCard
                    key={shot.id}
                    shot={shot}
                    onOpen={() => openLightbox(index)}
                  />
                ))}
              </div>

              {category.footer ? (
                <p className="mt-10 text-sm text-muted-foreground">
                  {category.footer}
                </p>
              ) : null}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <GalleryLightbox
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
        category={
          lightbox
            ? categories.find((c) => c.id === lightbox.categoryId)
            : undefined
        }
        index={lightbox?.index ?? 0}
        onIndexChange={(next) => {
          setLightbox((prev) => (prev ? { ...prev, index: next } : prev));
        }}
      />
    </div>
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

function GalleryLightbox({
  open,
  onOpenChange,
  category,
  index,
  onIndexChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: GalleryCategory;
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const shots = category?.shots ?? [];
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
              <span className="text-white/80">{category?.label}</span>
              <span aria-hidden className="h-px w-10 bg-white/20" />
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

            {shot ? (
              <LightboxFigure shot={shot} />
            ) : null}

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
                  {shots.map((s, i) => {
                    const selected = i === index;
                    return (
                      <LightboxThumb
                        key={s.id}
                        shot={s}
                        selected={selected}
                        onClick={() => onIndexChange(i)}
                      />
                    );
                  })}
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
