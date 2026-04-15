import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Service · Tenviq",
    description:
      "Terms governing the license, permitted use, and delivery of the Tenviq SaaS Starter.",
  };
}

const LAST_UPDATED = "April 14, 2026";
const EFFECTIVE = "April 14, 2026";
const VERSION = "1.0";

type TermsSection = {
  id: string;
  index: string;
  label: string;
  title: string;
  body: React.ReactNode;
};

const sections: TermsSection[] = [
  {
    id: "agreement",
    index: "01",
    label: "Agreement",
    title: "Binding agreement",
    body: (
      <>
        <p>
          These Terms of Service (the &ldquo;Terms&rdquo;) form a binding
          agreement between you (the &ldquo;Licensee&rdquo;, &ldquo;you&rdquo;)
          and Tenviq (&ldquo;Tenviq&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) governing your purchase of, access to, and use of
          the Tenviq SaaS Starter, including its source code, templates,
          documentation, updates, marketing assets, and any related materials
          (collectively, the &ldquo;Product&rdquo;).
        </p>
        <p>
          By purchasing, downloading, cloning, forking, or otherwise accessing
          the Product, you confirm that you have read, understood, and agree to
          be bound by these Terms. If you do not agree, you must not access or
          use the Product.
        </p>
        <p>
          You must be at least 18 years old and have the legal capacity to
          enter into a contract. If you act on behalf of an entity, you confirm
          you have authority to bind that entity to these Terms.
        </p>
      </>
    ),
  },
  {
    id: "license",
    index: "02",
    label: "License",
    title: "License grant",
    body: (
      <>
        <p>
          Subject to your full payment of the applicable fees and ongoing
          compliance with these Terms, Tenviq grants you a limited,
          non-exclusive, non-transferable, non-sublicensable, revocable license
          to access the Product and to use it strictly in accordance with the
          tier you purchased, as follows:
        </p>
        <ul>
          <li>
            <span className="font-semibold">Starter.</span> Use the Product to
            build and operate a single end-product owned by a single individual
            or entity.
          </li>
          <li>
            <span className="font-semibold">Pro.</span> Use the Product to
            build and operate end-products for a single team or entity, with
            internal team access for its employees and contractors working on
            those end-products.
          </li>
          <li>
            <span className="font-semibold">Agency.</span> Use the Product to
            build and deliver end-products for multiple paying clients, with
            each deliverable remaining a separate end-product owned by the
            respective client.
          </li>
        </ul>
        <p>
          An &ldquo;end-product&rdquo; means a genuinely customized application
          that meaningfully differs from the Product and that is not itself a
          boilerplate, starter kit, template, scaffold, or asset marketplace
          item.
        </p>
        <p>
          The license does not transfer any ownership. All rights not expressly
          granted are reserved by Tenviq.
        </p>
      </>
    ),
  },
  {
    id: "prohibited",
    index: "03",
    label: "Restrictions",
    title: "Prohibited uses",
    body: (
      <>
        <p>
          You must not, and must not permit any third party to, do any of the
          following:
        </p>
        <ul>
          <li>
            Resell, redistribute, sublicense, rent, lease, lend, share, host,
            publish, or otherwise make the Product (in whole or in part)
            available to any third party as source, a template, a boilerplate,
            a starter, a scaffold, a theme, or a course asset.
          </li>
          <li>
            Use the Product, or any substantial portion of it, to create a
            competing product, starter kit, boilerplate, template, code
            generator, or training dataset.
          </li>
          <li>
            Remove, obscure, or alter any copyright notices, license notices,
            attributions, or proprietary markings contained in the Product.
          </li>
          <li>
            Publish the Product in any public repository, package registry,
            gist, pastebin, asset store, or AI training corpus.
          </li>
          <li>
            Share your license, credentials, download links, or access keys
            with any person or entity outside the scope of your purchased
            tier.
          </li>
          <li>
            Use the Product for anything unlawful, infringing, defamatory,
            harassing, deceptive, or harmful, or in violation of any applicable
            law, regulation, or third-party right.
          </li>
          <li>
            Reverse-engineer, tamper with, or bypass any license enforcement,
            telemetry, or access-control mechanism we may include.
          </li>
        </ul>
        <p>
          Any breach of this section terminates your license immediately and
          automatically, without notice, and without refund.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    index: "04",
    label: "Ownership",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The Product is licensed, not sold. Tenviq retains all right, title,
          and interest in and to the Product, including all source code,
          architecture, designs, trademarks, trade names, logos, and
          documentation, together with any updates, improvements, and
          derivative works thereof.
        </p>
        <p>
          You own the custom application code you write on top of the Product
          and the proprietary business content you add. You do not acquire
          ownership of any portion of the Product itself, nor of any modified
          copy of it.
        </p>
        <p>
          The name &ldquo;Tenviq&rdquo;, the Tenviq logo, and all related
          branding are trademarks of Tenviq. Nothing in these Terms grants you
          any right to use them, and you must not represent your end-product
          as being made, endorsed, or affiliated with Tenviq.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    index: "05",
    label: "Payment",
    title: "Fees, taxes, and delivery",
    body: (
      <>
        <p>
          Fees are stated in United States Dollars unless otherwise indicated
          and are charged at the time of purchase via our payment processor.
          You are responsible for any applicable taxes, duties, currency
          conversion fees, and bank or card charges.
        </p>
        <p>
          The Product is delivered electronically. Access is provisioned once
          payment has been successfully captured. Tenviq has no obligation to
          deliver the Product until full payment has cleared.
        </p>
        <p>
          We reserve the right to refuse, suspend, or terminate any order at
          our sole discretion, including where we reasonably suspect fraud,
          chargeback risk, sanctions exposure, or breach of these Terms.
        </p>
      </>
    ),
  },
  {
    id: "no-refunds",
    index: "06",
    label: "No refunds",
    title: "All sales are final",
    body: (
      <>
        <p>
          The Product is a digital good delivered electronically. Because the
          Product cannot be &ldquo;returned&rdquo; once accessed, downloaded,
          cloned, forked, viewed, or inspected,{" "}
          <span className="font-semibold text-foreground">
            all sales are final and no refunds, credits, exchanges, or
            cancellations are offered
          </span>
          , in whole or in part, under any circumstances.
        </p>
        <p>This no-refund policy applies, without limitation, where:</p>
        <ul>
          <li>You change your mind.</li>
          <li>You did not read the description, demo, or documentation.</li>
          <li>
            The Product does not fit your project, stack, taste, or personal
            expectations.
          </li>
          <li>You no longer need the Product.</li>
          <li>You are unable or unwilling to use the Product.</li>
          <li>A third-party dependency changes, deprecates, or breaks.</li>
          <li>A specific feature is missing or differs from your vision.</li>
          <li>You purchased the wrong tier.</li>
          <li>You received the Product as a gift.</li>
        </ul>
        <p>
          You expressly consent to immediate delivery of digital content and
          acknowledge that this waives any statutory right of withdrawal or
          cooling-off period that might otherwise apply to digital goods.
        </p>
        <p>
          You agree not to initiate any chargeback, payment reversal, or
          dispute for a transaction that complies with these Terms. Any such
          action will be treated as a material breach and grounds for
          immediate license termination and recovery of the disputed amount
          plus associated fees.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    index: "07",
    label: "Updates",
    title: "Versions and updates",
    body: (
      <>
        <p>
          Tenviq may, but is not obligated to, release updates, patches, and
          new versions of the Product. When updates are made available to your
          tier, they are provided under these same Terms.
        </p>
        <p>
          &ldquo;Lifetime updates&rdquo; means updates we choose to publish
          while Tenviq continues to distribute the Product commercially in its
          current product line. Tenviq may, at any time and for any reason,
          discontinue the Product, rename it, restructure tiers, change
          pricing, or cease distribution without liability.
        </p>
        <p>
          Tenviq has no obligation to maintain backward compatibility, support
          any specific version, or provide migration paths between versions.
        </p>
      </>
    ),
  },
  {
    id: "support",
    index: "08",
    label: "Support",
    title: "Support is not guaranteed",
    body: (
      <>
        <p>
          Unless expressly stated as part of a separately purchased support
          plan, the Product is provided without any technical support, bug
          triage, or consulting. Community channels, if any, are offered on a
          best-effort basis with no service levels.
        </p>
        <p>
          Support, when offered, applies only to the Product itself and never
          to your custom modifications, third-party integrations, deployment
          environments, infrastructure, data, or business logic.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    index: "09",
    label: "Third parties",
    title: "Third-party services and dependencies",
    body: (
      <>
        <p>
          The Product is built to integrate with third-party services and
          open-source libraries, including but not limited to hosting
          providers, payment processors, authentication services, email
          providers, analytics tools, and AI model providers.
        </p>
        <p>
          You are solely responsible for complying with the terms, privacy
          policies, and acceptable-use policies of each third-party service
          you choose to use. Tenviq is not a party to, and assumes no
          liability for, any contract between you and a third-party provider.
        </p>
        <p>
          Open-source components redistributed within the Product remain
          governed by their original licenses, which are preserved in the
          Product&apos;s source.
        </p>
      </>
    ),
  },
  {
    id: "no-warranty",
    index: "10",
    label: "Warranty",
    title: "Warranty disclaimer",
    body: (
      <>
        <p className="font-semibold text-foreground">
          THE PRODUCT IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED,
          STATUTORY, OR OTHERWISE.
        </p>
        <p>
          To the maximum extent permitted by applicable law, Tenviq disclaims
          all warranties, including but not limited to warranties of
          merchantability, fitness for a particular purpose, title,
          non-infringement, quiet enjoyment, accuracy, completeness, security,
          and uninterrupted or error-free operation.
        </p>
        <p>
          Tenviq does not warrant that the Product will meet your
          requirements, that it will be compatible with any specific
          environment, that defects will be corrected, or that the Product is
          free of viruses, vulnerabilities, or other harmful components. You
          assume the entire risk as to the selection, use, and results
          obtained from the Product.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    index: "11",
    label: "Liability",
    title: "Limitation of liability",
    body: (
      <>
        <p className="font-semibold text-foreground">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TENVIQ&apos;S
          TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THE PRODUCT
          OR THESE TERMS IS LIMITED TO THE AMOUNT YOU ACTUALLY PAID TO TENVIQ
          FOR THE PRODUCT IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING
          RISE TO THE CLAIM.
        </p>
        <p>
          In no event will Tenviq, its founders, employees, contractors,
          affiliates, or licensors be liable for any indirect, incidental,
          special, consequential, exemplary, or punitive damages, or for any
          loss of profits, revenue, data, goodwill, reputation, business
          opportunity, or substitute goods or services, even if advised of
          the possibility of such damages and regardless of the theory of
          liability.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of
          certain damages. In those jurisdictions, the above limitations apply
          only to the maximum extent permitted by law.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    index: "12",
    label: "Indemnity",
    title: "Indemnification",
    body: (
      <>
        <p>
          You agree to defend, indemnify, and hold harmless Tenviq and its
          founders, employees, contractors, affiliates, and licensors from and
          against any and all claims, damages, liabilities, losses, costs, and
          expenses (including reasonable legal fees) arising out of or related
          to:
        </p>
        <ul>
          <li>Your use of the Product or your end-products;</li>
          <li>Your breach of these Terms;</li>
          <li>
            Your violation of any applicable law, regulation, or third-party
            right;
          </li>
          <li>
            Any content, data, or code you add to, deploy with, or derive from
            the Product.
          </li>
        </ul>
        <p>
          Tenviq reserves the right, at its own expense, to assume the
          exclusive defense and control of any matter subject to
          indemnification, in which case you agree to cooperate fully.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    index: "13",
    label: "Termination",
    title: "Termination",
    body: (
      <>
        <p>
          Your license terminates automatically and immediately upon any
          breach of these Terms, without notice and without refund. Tenviq
          may, at its sole discretion, also terminate or suspend access for
          any reason with reasonable notice.
        </p>
        <p>
          Upon termination, you must cease all use of the Product, destroy any
          copies in your possession or control, and, upon request, certify
          destruction in writing. You may retain your custom end-product code
          so long as it no longer contains substantial portions of the
          Product.
        </p>
        <p>
          Sections covering ownership, restrictions, no refunds, warranty
          disclaimer, limitation of liability, indemnification, governing law,
          and any provisions that by their nature should survive, will
          survive termination.
        </p>
      </>
    ),
  },
  {
    id: "export",
    index: "14",
    label: "Export",
    title: "Export controls and sanctions",
    body: (
      <>
        <p>
          You represent that you are not located in, under the control of, or
          a national or resident of any country or entity subject to
          comprehensive sanctions, and that you are not on any restricted
          parties list maintained by a competent authority.
        </p>
        <p>
          You agree to comply with all applicable export control, import, and
          sanctions laws in connection with your use of the Product.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    index: "15",
    label: "Changes",
    title: "Changes to these Terms",
    body: (
      <>
        <p>
          Tenviq may update these Terms from time to time. The updated Terms
          will be posted at this URL with a revised &ldquo;Last updated&rdquo;
          date and version number. Material changes will take effect upon
          posting. Your continued use of the Product after the effective date
          constitutes your acceptance of the updated Terms.
        </p>
        <p>
          If you do not agree to the updated Terms, you must stop using the
          Product. No refund is owed as a result of a change to these Terms.
        </p>
      </>
    ),
  },
  {
    id: "law",
    index: "16",
    label: "Governing law",
    title: "Governing law and jurisdiction",
    body: (
      <>
        <p>
          These Terms are governed by the laws of the Province of Quebec and
          the federal laws of Canada applicable therein, without regard to
          conflict-of-law principles. The United Nations Convention on
          Contracts for the International Sale of Goods does not apply.
        </p>
        <p>
          Any dispute arising out of or related to these Terms or the Product
          will be brought exclusively in the courts sitting in the judicial
          district of Montreal, Quebec, Canada, and you consent to the
          personal jurisdiction and venue of those courts.
        </p>
        <p>
          You and Tenviq each waive any right to a jury trial and to
          participate in any class, collective, or representative proceeding
          with respect to any dispute related to the Product or these Terms.
        </p>
      </>
    ),
  },
  {
    id: "misc",
    index: "17",
    label: "Miscellaneous",
    title: "Miscellaneous",
    body: (
      <>
        <p>
          These Terms, together with any order receipt and the privacy
          policy, constitute the entire agreement between you and Tenviq
          regarding the Product and supersede all prior or contemporaneous
          agreements, representations, or understandings.
        </p>
        <p>
          If any provision is held invalid or unenforceable, the remaining
          provisions will remain in full force and effect, and the
          unenforceable provision will be modified to the minimum extent
          necessary to make it enforceable while preserving its intent.
        </p>
        <p>
          Tenviq&apos;s failure to enforce any right or provision of these
          Terms does not constitute a waiver of that right or provision. You
          may not assign or transfer these Terms without our prior written
          consent. Tenviq may assign these Terms freely, including in
          connection with a merger, acquisition, or sale of assets.
        </p>
        <p>
          Nothing in these Terms creates any partnership, joint venture,
          agency, employment, or fiduciary relationship between you and
          Tenviq.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    index: "18",
    label: "Contact",
    title: "Contact",
    body: (
      <>
        <p>
          For questions about these Terms or the Product, contact us at{" "}
          <a
            href="mailto:legal@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            legal@tenviq.com
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <header className="border-b border-border pb-10">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">Legal · Terms</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.025em] md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The license, permitted use, and delivery rules that govern every
          purchase of the Tenviq SaaS Starter. Read carefully &mdash; these
          Terms are binding from the moment you access the Product.
        </p>
        <dl className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
          <MetaItem label="Last updated" value={LAST_UPDATED} />
          <MetaItem label="Effective" value={EFFECTIVE} />
          <MetaItem label="Version" value={VERSION} mono />
        </dl>
      </header>

      <nav
        aria-label="Sections"
        className="mt-10 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-baseline gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {section.index}
            </span>
            <span className="text-sm font-medium group-hover:text-brand">
              {section.title}
            </span>
          </a>
        ))}
      </nav>

      <div className="mt-16 space-y-20">
        {sections.map((section) => (
          <LegalSection key={section.id} {...section} />
        ))}
      </div>

      <footer className="mt-24 border-t border-border pt-10">
        <p className="label-mono">End · Terms of Service</p>
        <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
          Tenviq &middot; v{VERSION} &middot; {EFFECTIVE}
        </p>
      </footer>
    </main>
  );
}

function MetaItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-card px-4 py-3">
      <dt className="label-mono">{label}</dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono text-sm tabular-nums"
            : "mt-1 text-sm font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function LegalSection({ id, index, label, title, body }: TermsSection) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="grid gap-6 md:grid-cols-[140px_1fr] md:gap-10">
        <div className="md:pt-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {index} &mdash; {label}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-[28px]">
            {title}
          </h2>
          <div className="legal-prose mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-brand/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-brand [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.65em] [&_li]:before:size-1 [&_li]:before:bg-brand [&_ul]:space-y-2">
            {body}
          </div>
        </div>
      </div>
    </section>
  );
}
