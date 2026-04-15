import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function LogoPeriod({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline  gap-[3px] text-[23px] font-semibold lowercase tracking-[-0.025em]",
        className,
      )}
    >
      <span>tenviq</span>
      <span
        aria-hidden
        className="inline-block size-[6px] translate-y-[1px] bg-brand"
      />
    </span>
  );
}
