"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryGrid } from "@/features/marketing/components/gallery-grid";
import {
  GalleryLightbox,
  type GalleryShot,
} from "@/features/marketing/components/gallery-lightbox";
import { cn } from "@/lib/utils";

export type { GalleryShot } from "@/features/marketing/components/gallery-lightbox";

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
  /** Top offset for the sticky tabs header. Matches marketing header height. */
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
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const didMount = React.useRef(false);

  const activeCategory =
    categories.find((c) => c.id === active) ?? categories[0];

  const handleTabChange = React.useCallback((value: string) => {
    setActive(value);
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

  const showTabs = categories.length > 1;

  return (
    <div className={cn("w-full", className)}>
      {showTabs ? (
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
              <CategoryBody
                category={category}
                onOpen={(index) => setLightboxIndex(index)}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : activeCategory ? (
        <div className="relative -mx-6 md:-mx-10">
          <CategoryBody
            category={activeCategory}
            onOpen={(index) => setLightboxIndex(index)}
          />
        </div>
      ) : null}

      <GalleryLightbox
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
        shots={activeCategory?.shots ?? []}
        index={lightboxIndex ?? 0}
        onIndexChange={(next) => setLightboxIndex(next)}
        label={activeCategory?.label}
      />
    </div>
  );
}

function CategoryBody({
  category,
  onOpen,
}: {
  category: GalleryCategory;
  onOpen: (index: number) => void;
}) {
  return (
    <>
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

        <GalleryGrid shots={category.shots} onOpen={onOpen} />

        {category.footer ? (
          <p className="mt-10 text-sm text-muted-foreground">
            {category.footer}
          </p>
        ) : null}
      </div>
    </>
  );
}
