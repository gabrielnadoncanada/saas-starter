import type { Metadata } from "next";

import { ContactForm } from "@/features/marketing/components/contact-form";

export const metadata: Metadata = {
  title: "Contact · Tenviq",
  description:
    "Get in touch with the Tenviq team. We read every message and usually reply within one business day.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24 md:px-10">
      <div className="mb-10 space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Contact
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Let&apos;s talk
        </h1>
        <p className="text-muted-foreground">
          Questions about licensing, a custom build, or a partnership? Send us a
          note and we&apos;ll get back to you shortly.
        </p>
      </div>

      <div className="border border-border bg-background p-6 md:p-8">
        <ContactForm />
      </div>
    </main>
  );
}
