import type { Metadata } from "next";

import { Section } from "@/features/marketing/components/section";
import { SectionHeading } from "@/features/marketing/components/section-heading";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of this service.",
};

export default function TermsPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Terms of Service"
        description="Placeholder terms of service. Replace with your real terms before launching."
      />

      <div className="prose prose-neutral dark:prose-invert mt-12 max-w-3xl">
        <p>
          <strong>Replace this page with your real terms of service.</strong>{" "}
          Work with a lawyer or use a reputable terms generator; this placeholder
          is not a substitute for real legal review.
        </p>

        <h2>1. Acceptance</h2>
        <p>
          By using this service, you agree to the terms described here. If you
          do not agree, do not use the service.
        </p>

        <h2>2. Account</h2>
        <p>
          You are responsible for the security of your account credentials and
          for all activity under your account.
        </p>

        <h2>3. Acceptable use</h2>
        <p>
          Describe what users may and may not do with your product. Be specific
          about abuse, scraping, automated access, and prohibited content.
        </p>

        <h2>4. Billing</h2>
        <p>
          Describe your billing, refund, and cancellation policy here.
        </p>

        <h2>5. Termination</h2>
        <p>
          Describe when and how accounts can be suspended or terminated, and
          what happens to user data afterward.
        </p>

        <h2>6. Disclaimer</h2>
        <p>
          The service is provided &ldquo;as is&rdquo; without warranties of any
          kind. Describe your liability limitations here.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about these terms should go to{" "}
          <code>legal@example.com</code>.
        </p>
      </div>
    </Section>
  );
}
