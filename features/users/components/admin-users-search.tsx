"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/shared/components/ui/input";

type AdminUsersSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AdminUsersSearch({ value, onChange }: AdminUsersSearchProps) {
  const t = useTranslations("users");

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder={"Search users..."}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
