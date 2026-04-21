import type { Metadata } from "next";

import {
  LegalPage,
  type LegalSection,
} from "@/features/marketing/components/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "License · Tenviq",
    description:
      "Commercial license for the Tenviq starter — what you get, what you can do with it, and what you cannot.",
  };
}

const LAST_UPDATED = "April 20, 2026";
const EFFECTIVE = "April 20, 2026";
const VERSION = "1.1";

const sections: LegalSection[] = [
  {
    id: "pricing",
    index: "01",
    label: "Pricing",
    title: "One license, three price points",
    body: (
      <>
        <p>
          Tenviq is sold under a{" "}
          <span className="font-semibold text-foreground">single license</span>
          . The three purchase options below are marketing cohort prices — they
          do not change the permissions granted or the features included. Every
          buyer receives the same license terms, the same codebase, and the
          same lifetime updates.
        </p>
        <div className="not-prose my-6 overflow-hidden border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cohort</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">
                  Founding
                </td>
                <td className="px-4 py-3 tabular-nums">$69 one-time</td>
                <td className="px-4 py-3">First 20 buyers</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">
                  Early access
                </td>
                <td className="px-4 py-3 tabular-nums">$149 one-time</td>
                <td className="px-4 py-3">Next 80 buyers</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">
                  Standard
                </td>
                <td className="px-4 py-3 tabular-nums">$249 one-time</td>
                <td className="px-4 py-3">All subsequent buyers</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Each purchase grants{" "}
          <span className="font-semibold text-foreground">
            one developer seat
          </span>
          . A &ldquo;developer&rdquo; means a single natural person who reads,
          writes, compiles, or executes the Product&rsquo;s source code as
          part of their work. Seats are personal and cannot be shared, pooled,
          or transferred between individuals. If your team needs additional
          seats, contact us and we will issue them at the cohort price active
          at the time of request.
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
          Subject to the terms of this agreement, Tenviq grants you a
          perpetual, worldwide, non-exclusive, non-transferable license to:
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
            attribution notices contained in the Product&rsquo;s source code
            or documentation. You may freely remove Tenviq branding from the
            user-facing surfaces of your End Products (logos, copy, marketing
            pages) — this is expected.
          </li>
          <li>
            Share your seat, license key, or GitHub access with any individual
            other than the single developer the seat was issued for.
          </li>
          <li>
            Exceed the seat count you purchased. If your team grows, contact
            us to purchase additional seats at the cohort price active at the
            time of request.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "end-products",
    index: "04",
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
    index: "05",
    label: "Delivery",
    title: "Delivery",
    body: (
      <>
        <p>
          After purchase, Tenviq invites the GitHub account you provide to a
          private repository containing the Product. Access to this
          repository is the sole method of delivery. The Product is available
          in full immediately after the invitation is sent.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    index: "06",
    label: "Updates",
    title: "Updates and support",
    body: (
      <>
        <ul>
          <li>
            Lifetime updates are included with every purchase. Updates are
            published to the same private repository you were invited to at
            purchase.
          </li>
          <li>
            Email support is available for questions directly related to the
            Product. Support does not include custom development, consulting,
            or debugging of your End Products.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "refunds",
    index: "07",
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
    index: "08",
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
    index: "09",
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
    index: "10",
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
    index: "11",
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
    <LegalPage
      sections={sections}
      meta={{
        eyebrow: "Legal · License",
        title: "Commercial License",
        description:
          "The legal agreement between you and Tenviq for using the Tenviq starter codebase. By purchasing, downloading, or accessing the Product, you agree to these terms.",
        lastUpdated: LAST_UPDATED,
        effective: EFFECTIVE,
        version: VERSION,
        footerLabel: "End · License",
      }}
    />
  );
}
