import { AppPreview } from "./app-preview";

export function HeroMedia() {
  return (
    <div className="relative px-10 pb-20 pt-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,hsl(var(--brand-hsl)/0.16),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1180px]">
        <AppPreview />
        <div className="mt-3.5 flex justify-between font-mono text-[11px] tracking-[0.1em] text-muted-foreground/60">
          <span>FIG. 01 — THE APP YOU CLONE · MULTI-TENANT FROM DAY ONE</span>
          <span>APP.TENVIQ.DEV — LIVE DEMO</span>
        </div>
      </div>
    </div>
  );
}
