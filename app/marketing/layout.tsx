import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tenviq — The B2B SaaS starter you keep shipping from",
  description:
    "Multi-tenant orgs, Stripe with capability-based plan gating, admin surfaces, and an AI assistant with tool calling — in a codebase built to be read, not decoded.",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen w-full bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
