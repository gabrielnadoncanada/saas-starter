"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
          <h1 className="text-7xl font-bold">500</h1>
          <p className="font-medium">Something went wrong.</p>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. The team has been notified.
          </p>
          <Button className="mt-4" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
