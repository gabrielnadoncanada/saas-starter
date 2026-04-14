import Link from "next/link";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AnnouncementPillProps = {
  label: string;
  text: string;
  href?: string;
  className?: string;
};

export function AnnouncementPill({
  label,
  text,
  href,
  className,
}: AnnouncementPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1",
        className,
      )}
    >
      <Badge className="rounded-full">{label}</Badge>
      <span className="text-muted-foreground text-sm">{text}</span>

      {href ? (
        <Button asChild size="icon" variant="ghost" className="size-7 rounded-full">
          <Link href={href} aria-label={text}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
