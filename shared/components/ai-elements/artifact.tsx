"use client";

import { type LucideIcon, XIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export const Artifact = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <section
    className={cn(
      "overflow-hidden rounded-xl border bg-card shadow-sm",
      className,
    )}
    {...props}
  />
);

export const ArtifactHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <header
    className={cn(
      "flex items-start justify-between gap-4 border-b bg-muted/30 px-4 py-3",
      className,
    )}
    {...props}
  />
);

export const ArtifactTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("font-semibold text-sm", className)} {...props} />
);

export const ArtifactDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("mt-1 text-xs text-muted-foreground", className)}
    {...props}
  />
);

export const ArtifactActions = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
);

type ArtifactActionProps = ComponentProps<typeof Button> & {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
};

export function ArtifactAction({
  icon: Icon,
  label,
  tooltip,
  ...props
}: ArtifactActionProps) {
  const button = (
    <Button
      aria-label={label}
      size="icon-xs"
      type="button"
      variant="ghost"
      {...props}
    >
      <Icon className="size-3.5" />
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export const ArtifactClose = (props: ComponentProps<typeof Button>) => (
  <Button
    aria-label="Close"
    size="icon-xs"
    type="button"
    variant="ghost"
    {...props}
  >
    <XIcon className="size-3.5" />
  </Button>
);

export const ArtifactContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...props} />
);
