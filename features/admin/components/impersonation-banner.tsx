"use client";

import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { authClient } from "@/shared/lib/auth/auth-client";

export function ImpersonationBanner() {
  const router = useRouter();

  async function handleStop() {
    try {
      await authClient.admin.stopImpersonating();
      toast.success("Stopped impersonating");
      router.push("/admin/users");
      router.refresh();
    } catch {
      toast.error("Failed to stop impersonating");
    }
  }

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-center gap-3 bg-destructive px-4 py-2 text-sm text-destructive-foreground">
      <Eye className="size-4" />
      <span>You are impersonating a user</span>
      <Button
        variant="secondary"
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={handleStop}
      >
        <X className="size-3" />
        Stop impersonating
      </Button>
    </div>
  );
}
