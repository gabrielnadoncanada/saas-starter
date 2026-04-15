import { LogoPeriod } from "@/features/marketing/components/logo-period";

export function DocsBrandTitle() {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoPeriod />
      <span aria-hidden className="hidden h-4 w-px bg-border md:inline-block" />
      <span className="hidden label-mono md:inline">
        Docs
      </span>
    </span>
  );
}
