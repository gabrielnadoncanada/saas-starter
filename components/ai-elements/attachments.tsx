"use client";

import { Button } from "@/shared/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import { cn } from "@/shared/lib/utils";
import { FileText, XIcon } from "lucide-react";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { createContext, useContext } from "react";

import type { PromptAttachment } from "./prompt-input-state";

const AttachmentContext = createContext<{ data: PromptAttachment; onRemove?: () => void } | null>(null);

export function Attachments({
  className,
  variant = "inline",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "inline" | "grid" | "list" }) {
  return <div className={cn(variant === "inline" ? "flex flex-wrap gap-2" : "grid gap-2", className)} {...props} />;
}

export function Attachment({
  children,
  data,
  onRemove,
}: PropsWithChildren<{ data: PromptAttachment; onRemove?: () => void }>) {
  return <AttachmentContext.Provider value={{ data, onRemove }}>{children}</AttachmentContext.Provider>;
}

export function AttachmentPreview({ className }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(AttachmentContext);
  if (!context) return null;
  const isImage = context.data.mediaType?.startsWith("image/");
  const preview = isImage ? (
    <img alt={context.data.filename ?? "Attachment"} className="h-8 w-8 rounded object-cover" src={context.data.url} />
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
      <FileText className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn("flex items-center gap-2 rounded-full border bg-background px-2 py-1", className)}>
          {preview}
          <span className="max-w-40 truncate text-xs">{context.data.filename}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2">
        {isImage ? (
          <img alt={context.data.filename ?? "Attachment"} className="max-h-64 rounded object-contain" src={context.data.url} />
        ) : (
          <div className="text-sm">{context.data.filename}</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export function AttachmentRemove(props: React.ComponentProps<typeof Button>) {
  const context = useContext(AttachmentContext);
  if (!context?.onRemove) return null;
  return (
    <Button size="icon-xs" type="button" variant="ghost" onClick={context.onRemove} {...props}>
      <XIcon className="h-3 w-3" />
    </Button>
  );
}
