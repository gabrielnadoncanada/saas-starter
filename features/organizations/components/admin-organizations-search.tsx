"use client";

import { Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";

type AdminOrganizationsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AdminOrganizationsSearch({
  value,
  onChange,
}: AdminOrganizationsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={"Search organizations..."}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
