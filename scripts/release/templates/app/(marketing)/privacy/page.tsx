import type { Metadata } from "next";

import { Section } from "@/features/marketing/components/section";
import { SectionHeading } from "@/features/marketing/components/section-heading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How this service collects and uses personal information.",
};

export default function PrivacyPage() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description="Placeholder privacy policy. Replace with your real policy before collecting user data at scale."
      />

      <div className="prose prose-neutral dark:prose-invert mt-12 max-w-3xl">
        <p>
          <strong>Replace this page with your real privacy policy.</strong> The
          legal requirements vary by jurisdiction (GDPR, CCPA, PIPEDA, etc.) —
          consult a lawyer or a reputable policy generator.
        </p>

        <h2>1. What we collect</h2>
        <p>
          List the categories of data you collect: account info, usage data,
          cookies, payment info (via Stripe), etc.
        </p>

        <h2>2. How we use it</h2>
        <p>
          Describe how you use collected data: to provide the service, to
          communicate with users, to improve the product, for analytics, for
          billing, for security.
        </p>

        <h2>3. Who we share it with</h2>
        <p>
          List your processors: Stripe, Resend, any analytics provider, any
          hosting or database provider. Each should have its own data
          processing agreement.
        </p>

        <h2>4. Retention</h2>
        <p>
          Describe how long you keep user data and how users can request
          deletion.
        </p>

        <h2>5. User rights</h2>
        <p>
          Explain how users can access, export, correct, or delete their data,
          and who they contact to exercise those rights.
        </p>

        <h2>6. Contact</h2>
        <p>
          Privacy questions go to <code>privacy@example.com</code>.
        </p>
      </div>
    </Section>
  );
}
