"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="space-y-3 text-center">
        <h1 className="font-semibold text-2xl">Admin data failed to load</h1>
        <p className="text-muted-foreground text-sm">
          Retry the request after the server settles.
        </p>
        <Button onClick={() => reset()}>Retry</Button>
      </div>
    </div>
  );
}
