"use client";

import { Button } from "@/shared/components/ui/button";

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="space-y-3 text-center">
        <h1 className="font-semibold text-2xl">Settings failed to load</h1>
        <p className="text-muted-foreground text-sm">
          Try again. If this keeps happening, inspect the latest server logs.
        </p>
        <Button onClick={() => reset()}>Retry</Button>
      </div>
    </div>
  );
}
