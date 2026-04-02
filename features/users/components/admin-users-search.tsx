"use client";

import { Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

type AdminUsersSearchProps = {
  onChange: (value: string) => void;
  value: string;
};

export function AdminUsersSearch({ onChange, value }: AdminUsersSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search users..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
