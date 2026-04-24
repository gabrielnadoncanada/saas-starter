import { Button } from "@/components/ui/button";

import { SerifAccent } from "./primitives";

export function Hero() {
  return (
    <div className="mx-auto max-w-[1100px] px-10 pb-6 pt-20 text-center">
      <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-brand" />
        NEXT.JS 16 · REACT 19 · TAILWIND 4 · BETTER AUTH
      </div>

      <h1 className="text-balance font-sans text-[80px] font-medium leading-[1.02] tracking-[-0.04em]">
        The B2B SaaS base
        <br />
        you&apos;ll{" "}
        <SerifAccent className="text-brand">actually keep shipping</SerifAccent>
        <br />
        from.
      </h1>

      <p className="mx-auto mt-7 max-w-[620px] text-pretty text-[19px] leading-[1.55] text-muted-foreground">
        Multi-tenant orgs, Stripe with capability-based plan gating, admin
        surfaces, and an AI assistant with tool calling — in a codebase
        <span className="text-foreground"> built to be read, not decoded.</span>
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        <Button
          size="lg"
          className="bg-brand text-brand-foreground shadow-[0_12px_40px_-10px_hsl(var(--brand-hsl)/0.55)] hover:bg-brand/90"
        >
          Claim a founding seat · $99 →
        </Button>
        <Button size="lg" variant="outline">
          Open live demo ↗
        </Button>
      </div>

      <div className="mt-7 font-mono text-[11px] tracking-[0.1em] text-muted-foreground/60">
        ONE-TIME PAYMENT · LIFETIME UPDATES · UNLIMITED PRODUCTS · COMMERCIAL
        LICENSE
      </div>
    </div>
  );
}
