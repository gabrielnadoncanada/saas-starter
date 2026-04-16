import { Sparkles } from "lucide-react";

import { isDemoMode } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-indigo-500/40 bg-indigo-500/10 text-indigo-950 dark:text-indigo-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <span>
            Demo mode — data resets daily. Destructive actions are disabled.
          </span>
        </div>
        <a
          href="https://github.com/gabrielnadoncanada/saas-starter"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-indigo-700"
        >
          Get the code
        </a>
      </div>
    </div>
  );
}
