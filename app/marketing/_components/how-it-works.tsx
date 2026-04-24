import { Eyebrow, H2, SerifAccent } from "./primitives";

const steps = [
  {
    t: "00:00",
    h: "Pay",
    d: "Stripe checkout. One-time payment. No seat math, no sales call.",
  },
  {
    t: "00:02",
    h: "Get the repo",
    d: "Your GitHub is invited to the private repo. Full source, full history, commercial license.",
  },
  {
    t: "00:10",
    h: "Run locally",
    d: "pnpm setup walks you through every env var. Migrate, seed, and localhost is up with auth + multi-tenant + Stripe + AI.",
  },
  {
    t: "SUN",
    h: "Deploy demo",
    d: "Vercel button provisions a Neon Postgres. DEMO_MODE gives you a public instance prospects can try without breaking.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-10 py-[110px]">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="04">FROM PAY TO SHIP</Eyebrow>
        <H2 className="max-w-[760px]">
          From Stripe checkout to production{" "}
          <SerifAccent>in one weekend</SerifAccent>.
        </H2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.h} className="bg-background px-6 py-7">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-brand font-mono text-[11px] font-semibold text-brand-foreground">
                  {i + 1}
                </span>
                <span className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
                  {s.t}
                </span>
              </div>
              <div className="mt-4 text-[22px] font-medium tracking-[-0.02em]">
                {s.h}
              </div>
              <div className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
                {s.d}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-xl border border-border bg-[#08080a] px-5 py-4 font-mono text-[13px] leading-[1.8] text-[#d5d0c4]">
          <div>
            <span className="text-muted-foreground/60">$</span> git clone
            git@github.com:acme/app.git &&{" "}
            <span className="text-muted-foreground/60">cd</span> app
          </div>
          <div>
            <span className="text-muted-foreground/60">$</span> pnpm install &&
            pnpm setup
          </div>
          <div className="pl-5 text-xs text-muted-foreground">
            ? POSTGRES_URL · ? AUTH_SECRET · ? STRIPE_SECRET_KEY · ?
            RESEND_API_KEY · ? GOOGLE_AI_KEY
          </div>
          <div>
            <span className="text-muted-foreground/60">$</span> pnpm db:migrate
            && pnpm db:seed && pnpm dev
          </div>
          <div className="mt-1.5">
            <span className="text-brand">▲</span> ready at{" "}
            <span className="text-[#ffc58b]">http://localhost:3000</span>{" "}
            <span className="text-muted-foreground/60">·</span>{" "}
            demo@starter.local / demo123
          </div>
        </div>
      </div>
    </section>
  );
}
