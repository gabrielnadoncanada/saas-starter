/**
 * Default brand mark — a lowercase wordmark followed by a small brand-colored
 * square. Replace the markup to match your brand, or swap for an SVG logo.
 * The displayed text is driven by `siteConfig.wordmark`.
 */
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[3px] text-[23px] font-semibold lowercase tracking-[-0.025em]",
        className,
      )}
    >
      <span>{siteConfig.wordmark}</span>
      <span
        aria-hidden
        className="inline-block size-[6px] translate-y-[1px] bg-brand"
      />
    </span>
  );
}
