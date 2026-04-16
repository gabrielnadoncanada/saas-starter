import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "License · Tenviq",
    description:
      "Commercial license for the Tenviq SaaS Starter — tiers, permitted use, restrictions, and delivery terms.",
  };
}

const LAST_UPDATED = "April 16, 2026";
const EFFECTIVE = "April 16, 2026";
const VERSION = "1.0";

type LicenseSection = {
  id: string;
  index: string;
  label: string;
  title: string;
  body: React.ReactNode;
};

const sections: LicenseSection[] = [
  {
    id: "tiers",
    index: "01",
    label: "Tiers",
    title: "License tiers",
    body: (
      <>
        <p>
          The Product is sold under one of three tiers. Your tier is fixed at
          the time of purchase and determines how many developers may use the
          Product.
        </p>
        <div className="not-prose my-6 overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">White-label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">Solo</td>
                <td className="px-4 py-3 tabular-nums">$249 one-time</td>
                <td className="px-4 py-3">1 developer</td>
                <td className="px-4 py-3 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">Team</td>
                <td className="px-4 py-3 tabular-nums">$599 one-time</td>
                <td className="px-4 py-3">Up to 5 developers</td>
                <td className="px-4 py-3 text-muted-foreground">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">
                  Agency
                </td>
                <td className="px-4 py-3 tabular-nums">$1,299 one-time</td>
                <td className="px-4 py-3">Up to 10 developers</td>
                <td className="px-4 py-3 text-foreground">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A &ldquo;developer&rdquo; means a single natural person who reads,
          writes, compiles, or executes the Product&rsquo;s source code as
          part of their work. Seats are personal and cannot be shared,
          pooled, or transferred between individuals.
        </p>
      </>
    ),
  },
  {
    id: "grant",
    index: "02",
    label: "Grant",
    title: "Grant of license",
    body: (
      <>
        <p>
          Subject to the terms of this agreement and the tier you purchased,
          Tenviq grants you a perpetual, worldwide, non-exclusive,
          non-transferable license to:
        </p>
        <ul>
          <li>Use, copy, and modify the Product.</li>
          <li>
            Create an unlimited number of derivative works (&ldquo;End
            Products&rdquo;) based on the Product, for your own use or for
            your clients&rsquo; use.
          </li>
          <li>
            Use the Product and its derivative works for commercial purposes,
            including selling access to End Products to your own customers.
          </li>
          <li>
            Receive all future updates to the Product published by Tenviq for
            the lifetime of the Product.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "restrictions",
    index: "03",
    label: "Restrictions",
    title: "Restrictions",
    body: (
      <>
        <p>You may NOT:</p>
        <ul>
          <li>
            Sell, sublicense, rent, lease, lend, or redistribute the Product
            (or any substantial portion of its source code) as a standalone
            product, template, starter kit, boilerplate, or code library.
          </li>
          <li>
            Publish the Product&rsquo;s source code in any public repository,
            gist, or forum, whether for free or for a fee.
          </li>
          <li>
            Use the Product to build a product that competes with it,
            including any SaaS starter, boilerplate, template, or
            code-scaffolding tool intended for resale or public distribution.
          </li>
          <li>
            Remove, alter, or obscure any copyright, trademark, or
            attribution notices contained in the Product, except as permitted
            under the White-Label section if applicable to your tier.
          </li>
          <li>
            Share your seats, license key, or GitHub access with individuals
            who are not covered by your tier.
          </li>
          <li>
            Exceed the seat count of your tier. If your team grows beyond
            your tier&rsquo;s seat limit, you must upgrade to a higher tier.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "white-label",
    index: "04",
    label: "White-label",
    title: "White-label (Agency tier only)",
    body: (
      <>
        <p>
          Licensees on the Agency tier may remove or replace Tenviq&rsquo;s
          branding, copyright notices, and visible attribution in End
          Products delivered to clients. This right does not extend to Solo
          or Team tiers.
        </p>
      </>
    ),
  },
  {
    id: "end-products",
    index: "05",
    label: "End Products",
    title: "End Products",
    body: (
      <>
        <p>
          End Products are the applications, websites, or services you build
          using the Product. You own your End Products and all code you
          author within them. You are solely responsible for the data,
          content, and behavior of your End Products, including compliance
          with applicable laws, privacy regulations, and third-party service
          terms (Stripe, OpenAI, Resend, and others).
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    index: "06",
    label: "Delivery",
    title: "Delivery",
    body: (
      <>
        <p>
          After purchase, Tenviq will invite the number of GitHub accounts
          corresponding to your tier&rsquo;s seat count to a private
          repository containing the Product. Access to this repository is
          the sole method of delivery.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    index: "07",
    label: "Updates",
    title: "Updates and support",
    body: (
      <>
        <ul>
          <li>
            Lifetime updates are included in every tier. Updates are
            published to the same private repository you were invited to at
            purchase.
          </li>
          <li>
            Team and Agency tiers include priority email support for
            questions directly related to the Product. Support does not
            include custom development, consulting, or debugging of your End
            Products.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "refunds",
    index: "08",
    label: "Refunds",
    title: "Refunds",
    body: (
      <>
        <p>
          Because the Product is delivered as source code and is accessible
          in full immediately after purchase,{" "}
          <span className="font-semibold text-foreground">
            all sales are final and non-refundable
          </span>
          . If you have questions before purchasing, contact us first.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    index: "09",
    label: "Warranty",
    title: "Disclaimer of warranty",
    body: (
      <>
        <p className="font-mono text-xs uppercase tracking-[0.08em] leading-relaxed">
          The Product is provided &ldquo;as is&rdquo;, without warranty of
          any kind, express or implied, including but not limited to the
          warranties of merchantability, fitness for a particular purpose,
          and noninfringement. In no event shall Tenviq be liable for any
          claim, damages, or other liability, whether in an action of
          contract, tort, or otherwise, arising from, out of, or in
          connection with the Product or the use or other dealings in the
          Product.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    index: "10",
    label: "Termination",
    title: "Termination",
    body: (
      <>
        <p>
          This license terminates automatically if you breach any of its
          terms. Upon termination, you must stop using the Product, delete
          all copies of the source code in your possession, and remove the
          Product from any private repositories under your control. End
          Products already deployed to production at the time of termination
          may continue to run, but you may not apply further updates from
          the Product.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    index: "11",
    label: "Governing law",
    title: "Governing law",
    body: (
      <>
        <p>
          This agreement is governed by the laws of the jurisdiction in
          which Tenviq is established, without regard to conflict-of-law
          principles. Any dispute arising under this agreement shall be
          resolved in the courts of that jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    index: "12",
    label: "Contact",
    title: "Contact",
    body: (
      <>
        <p>
          For licensing questions, tier upgrades, or support, contact{" "}
          <a
            href="mailto:license@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            license@tenviq.com
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function LicensePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <header className="border-b border-border pb-10">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">Legal · License</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.025em] md:text-5xl">
          Commercial License
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The legal agreement between you and Tenviq for using the SaaS
          Starter codebase. By purchasing, downloading, or accessing the
          Product, you agree to these terms.
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
        <p className="label-mono">End · License</p>
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

function LegalSection({ id, index, label, title, body }: LicenseSection) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="grid gap-6 md:grid-cols-[140px_1fr] md:gap-10">
        <div className="md:pt-1">
          <p className="label-mono">
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
