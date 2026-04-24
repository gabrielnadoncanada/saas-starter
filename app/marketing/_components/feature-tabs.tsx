"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  FeatureCodePreview,
  type FeatureId,
} from "./feature-code-preview";
import { Eyebrow, H2, SerifAccent } from "./primitives";

type Tab = {
  id: FeatureId;
  label: string;
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
};

const tabs: Tab[] = [
  {
    id: "auth",
    label: "Auth",
    eyebrow: "BETTER AUTH · NOT NEXTAUTH",
    title: "Sign-in that already handles the messy cases.",
    desc: "Email/password, magic link, Google, GitHub. Account linking by verified email, device sessions, soft delete, email verification.",
    bullets: [
      "Better Auth with DB sessions",
      "OAuth: Google + GitHub",
      "Magic link via Resend",
      "Session + device management",
      "Soft account deletion",
    ],
  },
  {
    id: "orgs",
    label: "Organizations",
    eyebrow: "MULTI-TENANT FROM DAY ONE",
    title: "Workspaces, roles, invites — wired.",
    desc: "Active-org switching, role-aware routes, per-org data. Configurable: personal-only, organizations-only, or both.",
    bullets: [
      "Owner / Admin / Member roles",
      "Invite flow with email templates",
      "Active organization switching",
      "Per-org data scoping",
      "Personal-only or org-only modes",
    ],
  },
  {
    id: "billing",
    label: "Billing",
    eyebrow: "STRIPE + CAPABILITY GATING",
    title: "Stripe decides the plan. Your config decides the power.",
    desc: "Checkout, portal, webhooks, usage metering. Gate features with assertCapability, gate quotas with assertLimit. Monthly and yearly out of the box.",
    bullets: [
      "Checkout + customer portal",
      "Webhook-safe subscription state",
      "Capability-based feature flags",
      "Usage quotas with assertLimit",
      "Trials, automatic tax, tax ID collection",
    ],
  },
  {
    id: "admin",
    label: "Admin",
    eyebrow: "LOOKS REAL ON DAY ONE",
    title: "The admin surface your buyers expect.",
    desc: "User search, organization management, audit log, role-gated routes, soft delete. The stuff you'd normally skip for the demo.",
    bullets: [
      "User search + impersonation",
      "Organization management",
      "Audit log",
      "Role-gated routes",
      "Soft delete with recovery",
    ],
  },
  {
    id: "ai",
    label: "AI assistant",
    eyebrow: "VERCEL AI SDK · TOOL CALLING",
    title: "An AI that can actually touch your product.",
    desc: "Streaming chat, tool calling, model selection, persisted conversations — scoped to the active org. Providers: Google, OpenAI, Groq.",
    bullets: [
      "Streaming chat + persisted threads",
      "Tool calling with typed schemas",
      "Model picker (Google / OpenAI / Groq)",
      "Org-scoped conversations",
      "Credits tracked per plan",
    ],
  },
  {
    id: "dx",
    label: "Dev experience",
    eyebrow: "BUILT TO BE READ",
    title: "The convention you keep across projects.",
    desc: "Feature-first modules, strict TypeScript, Prisma multi-file schema, seed data, Vitest, Playwright e2e. pnpm setup asks you every env var and writes .env for you.",
    bullets: [
      "Feature-first structure",
      "Strict TypeScript",
      "Multi-file Prisma schema",
      "Seeded demo data",
      "Vitest + Playwright",
      "Interactive pnpm setup",
    ],
  },
];

export function FeatureTabs() {
  const [tab, setTab] = useState(0);
  const active = tabs[tab];

  return (
    <section id="features" className="px-10 py-[110px]">
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow n="02">WHAT&apos;S INSIDE</Eyebrow>
        <H2 className="max-w-[860px]">
          Six B2B surfaces, <SerifAccent>already wired</SerifAccent>.
        </H2>

        <div className="mt-10 flex flex-wrap gap-1.5" role="tablist">
          {tabs.map((tb, i) => (
            <Button
              key={tb.id}
              type="button"
              variant="outline"
              size="sm"
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={cn(
                "h-auto rounded-full px-4 py-2 text-sm font-medium",
                i === tab
                  ? "border-foreground bg-foreground text-background hover:bg-foreground"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              {tb.label}
            </Button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-10 rounded-[14px] border border-border bg-card p-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="font-mono text-[11px] tracking-[0.15em] text-brand">
              {active.eyebrow}
            </div>
            <div className="mt-3 text-balance text-[30px] font-medium leading-[1.15] tracking-[-0.03em]">
              {active.title}
            </div>
            <div className="mt-3.5 text-[14.5px] leading-[1.6] text-muted-foreground">
              {active.desc}
            </div>
            <div className="mt-5">
              {active.bullets.map((b) => (
                <div
                  key={b}
                  className="flex gap-2.5 py-1 text-[13.5px]"
                >
                  <span className="font-semibold text-brand">✓</span>
                  <span className="text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <FeatureCodePreview id={active.id} />
        </div>
      </div>
    </section>
  );
}
