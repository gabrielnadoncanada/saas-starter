import type { Metadata } from "next";

import { Section } from "@/features/marketing/components/section";
import { SectionHeading } from "@/features/marketing/components/section-heading";

export const metadata: Metadata = {
  title: "License",
  description: "License terms governing use of this product.",
};

export default function LicensePage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="License"
        description="Placeholder license page. Replace with your real license terms if you sell or distribute source code."
      />

      <div className="prose prose-neutral dark:prose-invert mt-12 max-w-3xl">
        <p>
          <strong>Replace this page with the license terms for your product.</strong>
        </p>
        <p>
          If you are building a hosted SaaS, this page may not be needed —
          delete it, or redirect to your Terms of Service. If you are selling
          source code or distributing a template, link here to the full license
          text (see <code>LICENSE.md</code> in the repo).
        </p>
      </div>
    </Section>
  );
}
