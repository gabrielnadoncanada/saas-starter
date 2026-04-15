import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";
import { LogoPeriod } from "@/features/marketing/components/logo-period";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const trustMarkers = [
  { label: "Auth", value: "better-auth" },
  { label: "Billing", value: "Stripe" },
  { label: "Multi-tenant", value: "Orgs + RBAC" },
  { label: "AI", value: "Assistant" },
];

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (user) {
    redirect(routes.app.dashboard);
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,_5fr)_minmax(0,_7fr)]">
        <div className="relative flex flex-col">
          <header className="flex items-center justify-between gap-4 px-6 py-5 md:px-10">
            <Link
              href={routes.marketing.home}
              className="group inline-flex items-center"
            >
              <LogoPeriod />
            </Link>
            <Link
              href={routes.marketing.home}
              className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft
                className="size-3 transition-transform group-hover:-translate-x-0.5"
                strokeWidth={1.75}
              />
              Back to site
            </Link>
          </header>

          <main className="flex flex-1 items-center justify-center px-6 py-8 md:px-10">
            <div className="w-full max-w-md">{props.children}</div>
          </main>

          <footer className="flex items-center justify-between gap-4 px-6 py-5 md:px-10">
            <span className="label-mono">© {new Date().getFullYear()}</span>
            <div className="flex items-center gap-4">
              <Link
                href={routes.marketing.terms}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href={routes.marketing.privacy}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Privacy
              </Link>
            </div>
          </footer>
        </div>

        <aside className="relative hidden overflow-hidden border-l border-border bg-muted/30 lg:block">
          <div
            aria-hidden
            className="bg-grid absolute inset-0 text-foreground opacity-[0.04]"
          />
          <div
            aria-hidden
            className="bg-brand-glow pointer-events-none absolute inset-0 opacity-70"
          />

          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <span className="label-mono">Chapter 01</span>
              <span className="h-px flex-1 bg-border" />
              <span className="label-mono">Access</span>
            </div>

            <div className="max-w-xl space-y-6">
              <span className="label-mono text-brand">The platform</span>
              <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] xl:text-5xl">
                Ship a real SaaS on
                <span className="text-brand"> day one.</span>
              </h2>
              <p className="max-w-md text-base text-muted-foreground">
                Auth, billing, multi-tenant orgs, and an AI assistant — wired
                up, themeable, and ready to extend.
              </p>

              <div className="grid grid-cols-2 gap-px border border-border bg-border">
                {trustMarkers.map((marker) => (
                  <div key={marker.label} className="bg-card p-4">
                    <p className="label-mono">{marker.label}</p>
                    <p className="mt-1.5 font-mono text-sm text-foreground tabular-nums">
                      {marker.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="label-mono">Canvas · 2026</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  "Every component is editable. Every flow is yours."
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 bg-brand" />
                <span aria-hidden className="size-1.5 bg-foreground/40" />
                <span aria-hidden className="size-1.5 bg-foreground/20" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
