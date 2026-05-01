"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ConnectAccountButton({
  label = "Connect Gmail",
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <Button asChild variant={variant}>
      <Link href="/api/email-agent/oauth/start">
        <Mail className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
