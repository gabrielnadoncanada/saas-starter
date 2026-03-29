"use client";

import { Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type UserDetailValueProps = {
  label: string;
  mono?: boolean;
  onCopy: () => void;
  value: string;
};

export function UserDetailValue({
  label,
  mono = false,
  onCopy,
  value,
}: UserDetailValueProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
        <Button variant="ghost" size="icon" className="size-5" onClick={onCopy}>
          <Copy className="size-3" />
        </Button>
      </div>
    </div>
  );
}
