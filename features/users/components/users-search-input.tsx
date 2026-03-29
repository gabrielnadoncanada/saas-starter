"use client";

import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

type UsersSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function UsersSearchInput({
  value,
  onChange,
}: UsersSearchInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
