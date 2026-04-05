"use client";

import { Button } from "@/shared/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">500</h1>
        <span className="font-medium">Something went wrong!</span>
        <p className="text-center text-muted-foreground">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => reset()}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
