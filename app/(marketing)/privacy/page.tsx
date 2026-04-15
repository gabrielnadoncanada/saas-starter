import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy · Tenviq",
    description:
      "How Tenviq collects, uses, shares, and protects personal information in connection with the Tenviq SaaS Starter.",
  };
}

const LAST_UPDATED = "April 14, 2026";
const EFFECTIVE = "April 14, 2026";
const VERSION = "1.0";

type PrivacySection = {
  id: string;
  index: string;
  label: string;
  title: string;
  body: React.ReactNode;
};

const sections: PrivacySection[] = [
  {
    id: "scope",
    index: "01",
    label: "Scope",
    title: "Who this policy applies to",
    body: (
      <>
        <p>
          This Privacy Policy (the &ldquo;Policy&rdquo;) describes how Tenviq
          (&ldquo;Tenviq&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) collects, uses, shares, and protects personal
          information of visitors and customers of the Tenviq marketing site
          and the Tenviq SaaS Starter (collectively, the
          &ldquo;Product&rdquo;).
        </p>
        <p>
          This Policy does not apply to applications you build using the
          Product. When you deploy the Product and collect data from your own
          users, you are the controller of that data and solely responsible
          for your own privacy practices.
        </p>
      </>
    ),
  },
  {
    id: "controller",
    index: "02",
    label: "Controller",
    title: "Data controller",
    body: (
      <>
        <p>
          Tenviq is the data controller for personal information collected
          through its marketing site and purchase flow. For privacy inquiries,
          contact{" "}
          <a
            href="mailto:privacy@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            privacy@tenviq.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "collection",
    index: "03",
    label: "What we collect",
    title: "Information we collect",
    body: (
      <>
        <p>
          We only collect what we need to sell, deliver, and improve the
          Product.
        </p>
        <ul>
          <li>
            <span className="font-semibold">Account information.</span> Name,
            email address, password hash, profile image, organization name,
            and authentication provider identifiers when you create an
            account.
          </li>
          <li>
            <span className="font-semibold">Purchase information.</span>{" "}
            Billing name, billing email, country, postal code for tax
            purposes, subscription status, invoices, and a payment-method
            reference. Full payment card details are collected and stored by
            our payment processor and never touch our servers.
          </li>
          <li>
            <span className="font-semibold">Usage data.</span> Pages visited,
            referrer, device type, browser, approximate location derived from
            IP address, timestamps, and in-product events we use to operate,
            secure, and improve the Product.
          </li>
          <li>
            <span className="font-semibold">Support communications.</span>{" "}
            Emails, messages, and any attachments you send us, along with
            our responses.
          </li>
          <li>
            <span className="font-semibold">
              Cookies and similar technologies.
            </span>{" "}
            Session cookies to keep you signed in, preference cookies, and
            optional analytics cookies. See Section 08.
          </li>
        </ul>
        <p>
          We do not intentionally collect special categories of personal data
          (for example, health, political opinions, biometrics). Please do not
          send such data through support channels.
        </p>
      </>
    ),
  },
  {
    id: "use",
    index: "04",
    label: "Uses",
    title: "How we use information",
    body: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>Create and operate your account and deliver the Product;</li>
          <li>
            Process purchases, issue invoices, and administer subscriptions;
          </li>
          <li>
            Provide customer support, announcements, and Product-related
            updates;
          </li>
          <li>
            Protect the Product against fraud, abuse, and unauthorized
            access;
          </li>
          <li>
            Operate, maintain, diagnose, secure, and improve the Product;
          </li>
          <li>
            Send transactional emails such as receipts, security alerts, and
            service notices;
          </li>
          <li>
            Send marketing emails only where permitted by law and with the
            ability to unsubscribe at any time;
          </li>
          <li>Comply with legal obligations and enforce our Terms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-basis",
    index: "05",
    label: "Legal basis",
    title: "Legal basis for processing",
    body: (
      <>
        <p>
          Where applicable privacy law (including the GDPR and the UK GDPR)
          requires a legal basis, we rely on:
        </p>
        <ul>
          <li>
            <span className="font-semibold">Contract.</span> To create your
            account, process payments, and deliver the Product.
          </li>
          <li>
            <span className="font-semibold">Legitimate interests.</span> To
            secure, operate, measure, and improve the Product, and to contact
            existing customers about closely related services.
          </li>
          <li>
            <span className="font-semibold">Consent.</span> For optional
            analytics cookies, marketing communications to new prospects, and
            any other processing that requires it. You can withdraw consent
            at any time.
          </li>
          <li>
            <span className="font-semibold">Legal obligation.</span> For tax,
            accounting, and compliance with lawful requests.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    index: "06",
    label: "Sharing",
    title: "Who we share information with",
    body: (
      <>
        <p>
          We do not sell or rent personal information. We share it only with
          vetted service providers who help us run the Product under
          contractual confidentiality and data-protection obligations. These
          providers act as processors on our behalf and include:
        </p>
        <ul>
          <li>Hosting and content delivery providers;</li>
          <li>Our payment processor for purchases and invoicing;</li>
          <li>Our transactional email provider;</li>
          <li>
            Our authentication, identity, and OAuth providers, limited to the
            methods you choose to use;
          </li>
          <li>Error-monitoring and product-analytics tools;</li>
          <li>Customer-support tooling;</li>
          <li>AI model providers, only when you actively use AI features.</li>
        </ul>
        <p>We also share information when:</p>
        <ul>
          <li>
            Required by law, subpoena, court order, or valid governmental
            request;
          </li>
          <li>
            Needed to protect the rights, property, or safety of Tenviq, our
            customers, or others, including to prevent fraud;
          </li>
          <li>
            Part of a merger, acquisition, financing, or sale of assets, in
            which case we will require the recipient to honor this Policy.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    index: "07",
    label: "Retention",
    title: "How long we keep information",
    body: (
      <>
        <p>
          We retain personal information only for as long as needed for the
          purposes described in this Policy.
        </p>
        <ul>
          <li>
            Account information is kept for the life of your account and for
            a reasonable period thereafter to handle reinstatement, fraud
            prevention, and legal obligations.
          </li>
          <li>
            Purchase records are retained for the period required by tax and
            accounting law in the relevant jurisdictions.
          </li>
          <li>
            Support communications are retained while they remain relevant to
            ongoing support, and are then archived or deleted.
          </li>
          <li>
            Usage logs are retained for security, fraud, and diagnostics for a
            limited period, typically not exceeding twenty-four months.
          </li>
        </ul>
        <p>
          When retention expires, we delete or irreversibly anonymize the
          information.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    index: "08",
    label: "Cookies",
    title: "Cookies and tracking",
    body: (
      <>
        <p>
          We use a minimal set of cookies and equivalent technologies:
          strictly necessary cookies to keep you signed in and to maintain
          session state, preference cookies to remember your settings, and
          analytics cookies to understand aggregated usage.
        </p>
        <p>
          Where required, analytics and non-essential cookies are set only
          with your consent. You can block or delete cookies in your browser
          settings at any time; strictly necessary cookies cannot be disabled
          without breaking the Product.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    index: "09",
    label: "Transfers",
    title: "International data transfers",
    body: (
      <>
        <p>
          Tenviq and its service providers may process personal information in
          countries other than your country of residence, including the United
          States and Canada. Where required, we rely on recognized transfer
          mechanisms such as Standard Contractual Clauses or equivalent
          safeguards.
        </p>
        <p>
          By using the Product, you understand that your information may be
          transferred to and processed in these countries.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    index: "10",
    label: "Your rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access,
          correct, update, or delete your personal information; to object to
          or restrict certain processing; to receive a portable copy of your
          data; and to withdraw consent.
        </p>
        <p>
          To exercise these rights, contact{" "}
          <a
            href="mailto:privacy@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            privacy@tenviq.com
          </a>
          . We will respond within the timeframe required by applicable law.
          We may verify your identity before acting on a request and may
          decline requests that are unfounded, excessive, or that would
          compromise the rights of others.
        </p>
        <p>
          You also have the right to lodge a complaint with your local data
          protection authority, though we hope you will contact us first.
        </p>
      </>
    ),
  },
  {
    id: "security",
    index: "11",
    label: "Security",
    title: "How we protect information",
    body: (
      <>
        <p>
          We apply reasonable technical and organizational measures designed
          to protect personal information, including encryption in transit,
          access controls, hashed credentials, audit logging, and regular
          review of our infrastructure.
        </p>
        <p>
          No method of electronic storage or transmission is perfectly
          secure. In the event of a personal data breach that is likely to
          result in a risk to your rights, we will notify affected users and
          the relevant authorities as required by law.
        </p>
      </>
    ),
  },
  {
    id: "children",
    index: "12",
    label: "Children",
    title: "Children",
    body: (
      <>
        <p>
          The Product is not intended for, and we do not knowingly collect
          personal information from, individuals under 16 years of age. If
          you believe a minor has provided us with personal information,
          contact{" "}
          <a
            href="mailto:privacy@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            privacy@tenviq.com
          </a>{" "}
          and we will take appropriate steps to delete it.
        </p>
      </>
    ),
  },
  {
    id: "third-party-links",
    index: "13",
    label: "Third-party links",
    title: "Third-party sites and services",
    body: (
      <>
        <p>
          The Product may link to third-party websites, services, and
          dependencies that are not operated by Tenviq. Their information
          practices are governed by their own policies, which we recommend
          you review. Tenviq is not responsible for the content, privacy
          practices, or security of third-party sites.
        </p>
      </>
    ),
  },
  {
    id: "do-not-track",
    index: "14",
    label: "Do Not Track",
    title: "Do Not Track",
    body: (
      <>
        <p>
          Some browsers transmit &ldquo;Do Not Track&rdquo; signals. Because
          there is no uniform industry standard for interpreting these
          signals, we do not respond to them at this time. We will update
          this Policy if and when a standard is adopted.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    index: "15",
    label: "Changes",
    title: "Changes to this Policy",
    body: (
      <>
        <p>
          We may update this Policy from time to time. The updated Policy
          will be posted at this URL with a revised &ldquo;Last updated&rdquo;
          date and version number. Material changes will be communicated
          prominently in the Product or by email. Your continued use of the
          Product after the effective date means you accept the updated
          Policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    index: "16",
    label: "Contact",
    title: "Contact",
    body: (
      <>
        <p>
          For any question about this Policy, your personal information, or
          our privacy practices, contact{" "}
          <a
            href="mailto:privacy@tenviq.com"
            className="underline decoration-brand/50 underline-offset-4 hover:decoration-brand"
          >
            privacy@tenviq.com
          </a>
          .
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <header className="border-b border-border pb-10">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">Legal · Privacy</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.025em] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          How we collect, use, share, and protect personal information in
          connection with the Tenviq marketing site and the Tenviq SaaS
          Starter.
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
        <p className="label-mono">End · Privacy Policy</p>
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

function LegalSection({ id, index, label, title, body }: PrivacySection) {
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
