import Image from "next/image";
import * as React from "react";

import { Card } from "@/components/ui/card";
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
};

export function Hero({
  pill,
  title,
  description,
  actions,
  imageSrc,
  imageAlt = "Product preview",
  imageWidth = 1440,
  imageHeight = 900,
  className,
}: HeroProps) {
  return (
    <div className={cn("flex flex-col gap-10", className)}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        {pill}

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            {description}
          </p>
        </div>

        {actions}
      </div>

      {imageSrc ? (
        <Card className="overflow-hidden p-0 shadow-sm mt-10">
          <Image
            priority
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="w-full rounded-lg border"
          />
        </Card>
      ) : null}
    </div>
  );
}
