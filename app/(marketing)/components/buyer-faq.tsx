'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What exactly do I get?',
    answer:
      'You get the full source code of a production-ready Next.js SaaS starter. That includes authentication (magic link + OAuth), Stripe billing with three pricing models, plan gating with capability checks and usage limits, team management with roles and invitations, a polished dashboard shell, a working tasks CRUD example, an AI-ready assistant module with real task actions plus demo inbox and invoice draft scaffolds, PostgreSQL + Prisma setup, email templates, and 72 documentation files including 31 step-by-step customization guides.',
  },
  {
    question: 'What is NOT included?',
    answer:
      'This is a starter, not a finished product. You will need to build your own product features on top of it. It does not include hosting, domain names, Stripe account setup, or third-party API keys. It also does not include a mobile app, admin panel, analytics dashboard, a real email inbox integration, or persisted invoicing flows - those are features you build yourself using the patterns provided.',
  },
  {
    question: 'What is the license?',
    answer:
      'Starter and Pro include an MIT license for use in one commercial product. The Agency tier includes rights to use the starter across unlimited client projects and internal products. You may not resell or redistribute the starter itself.',
  },
  {
    question: 'Do I get updates?',
    answer:
      'All tiers include lifetime access to the version you purchase. Pro and Agency tiers include access to minor updates within the current version line. Major version upgrades (e.g. if the starter is rebuilt for a new Next.js major version) may be offered as a separate paid upgrade.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Starter is documentation-only - the 72 included docs cover setup, architecture, customization, and troubleshooting. Pro includes priority email support for 6 months. Agency includes priority email support for 12 months. This is not an agency-style retainer - support covers questions about the starter itself, not custom feature development.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      'Yes. 30-day refund policy. If the starter does not match what is described on this page, contact us for a full refund. Because the product is source code delivered immediately, refund requests must include a specific reason.',
  },
  {
    question: 'Who is this for?',
    answer:
      'Technical founders, solo developers, small teams, and agencies who build SaaS products with Next.js and want to skip the 2-8 weeks of foundation work (auth, billing, teams, plan enforcement, dashboard). You should be comfortable with TypeScript, React, and Next.js. This is not a no-code tool.',
  },
  {
    question: 'How is this different from free boilerplates?',
    answer:
      'Free boilerplates give you auth and maybe Stripe checkout. This starter gives you enforced plan gating - capability-based feature flags and usage limits that actually control what users can do based on their plan. It also includes three billing models, team management, 72 docs, a working CRUD example, and an AI-ready monetization pattern you can adapt instead of inventing from scratch.',
  },
  {
    question: 'How is this different from ShipFast or MakerKit?',
    answer:
      'Most starters focus on getting Stripe connected and leave plan enforcement to you. This starter ships a working plan gating system - assertCapability() and assertLimit() calls that enforce what each plan allows. You can gate any feature or enforce any usage quota in two lines of code. The codebase is also feature-organized, so you can read, modify, or delete any feature without learning a custom abstraction layer first.',
  },
  {
    question: 'Can I use this for client projects?',
    answer:
      'Starter and Pro are licensed for one commercial product (yours). If you want to use it across multiple client projects, the Agency tier includes multi-project commercial rights.',
  },
  {
    question: 'What tech stack does this use?',
    answer:
      'Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui, Prisma ORM, PostgreSQL, Stripe, Better Auth, Resend for email, the Vercel AI SDK for the assistant module, Vitest for testing, Zod for validation, and TanStack React Table.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'If you have PostgreSQL and Stripe API keys ready, first run takes about 10 minutes: clone, install, configure env, run migrations, seed, and start the dev server. The getting-started guide walks through every step. AI setup adds one provider key and an optional AI_PROVIDER switch.',
  },
];

export function BuyerFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <dl className="divide-y divide-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-4">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-base font-medium text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`ml-4 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </dt>
                {isOpen && (
                  <dd className="mt-2 pr-12 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
