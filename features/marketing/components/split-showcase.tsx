"use client";

import Image from "next/image";
import * as React from "react";

import { Card } from "@/components/ui/card";
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
  title?: React.ReactNode;
  description?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  reverse?: boolean;
  items?: SplitShowcaseItem[];
  defaultItemId?: string;
};

export function SplitShowcase({
  title,
  description,
  imageSrc,
  imageAlt,
  imageWidth = 1200,
  imageHeight = 900,
  reverse = false,
  items,
  defaultItemId,
}: SplitShowcaseProps) {
  if (items?.length) {
    return (
      <TabbedSplitShowcase
        items={items}
        defaultItemId={defaultItemId}
        reverse={reverse}
      />
    );
  }

  if (!imageSrc) {
    return null;
  }

  return (
    <Card className="p-6 md:p-8">
      <div
        className={cn(
          "grid items-center gap-8 lg:grid-cols-2",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h3>
          <p className="text-muted-foreground text-base leading-7 md:text-lg">
            {description}
          </p>
        </div>

        <Image
          src={imageSrc}
          alt={imageAlt ?? "Showcase image"}
          width={imageWidth}
          height={imageHeight}
          className="w-full rounded-lg border"
        />
      </div>
    </Card>
  );
}

type TabbedSplitShowcaseProps = {
  items: SplitShowcaseItem[];
  defaultItemId?: string;
  reverse?: boolean;
};

function TabbedSplitShowcase({
  items,
  defaultItemId,
  reverse = false,
}: TabbedSplitShowcaseProps) {
  const initialItem =
    items.find((item) => item.id === defaultItemId) ?? items[0];

  const [activeItemId, setActiveItemId] = React.useState(initialItem.id);

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

  return (
    <Card className="bg-muted/20 p-4 md:p-6">
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:gap-8 xl:gap-16 2xl:gap-20",
          reverse && "md:[&>*:first-child]:order-2",
        )}
      >
        <div className="flex flex-col">
          {items.map((item, index) => {
            const isActive = item.id === activeItem.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItemId(item.id)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-4 text-left outline-none transition-all duration-200",
                  index !== items.length - 1 && "border-b border-border/50",
                  isActive ? "bg-muted md:bg-transparent" : "hover:bg-muted/50",
                )}
                aria-pressed={isActive}
              >
                <h3
                  className={cn(
                    "text-2xl font-medium tracking-tight transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                </h3>

                <div
                  className={cn(
                    "overflow-hidden text-lg leading-6 font-medium text-muted-foreground transition-all duration-200",
                    isActive
                      ? "mt-1 max-h-40 opacity-100"
                      : "mt-0 max-h-0 opacity-0",
                  )}
                >
                  <p>{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <div
            key={activeItem.id}
            className="animate-in fade-in-0 zoom-in-95 block w-full duration-200"
          >
            <ShowcaseMedia item={activeItem} />
          </div>

          {items.map((item) => {
            if (item.media.type !== "image") {
              return null;
            }

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
    </Card>
  );
}

function ShowcaseMedia({ item }: { item: SplitShowcaseItem }) {
  if (item.media.type === "video") {
    return (
      <video
        key={item.media.src}
        className="w-full rounded-lg border"
        width={item.media.width ?? 1600}
        height={item.media.height ?? 1000}
        playsInline
        autoPlay
        muted
        loop
        preload="auto"
        poster={item.media.poster}
      >
        <source src={item.media.src} type="video/mp4" />
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
      className="w-full rounded-lg border"
    />
  );
}
