'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

const defaultFaqs: FaqItem[] = [
  {
    question: 'Can I try it before I pay?',
    answer:
      'Yes. Every paid plan includes a free trial so you can explore the full feature set before being charged.',
  },
  {
    question: 'Can I change my plan later?',
    answer:
      'Absolutely. You can upgrade, downgrade, or cancel at any time from your billing settings. Changes take effect immediately.',
  },
  {
    question: 'What happens when I hit a usage limit?',
    answer:
      'You will see a prompt to upgrade. Your existing data is never deleted — you just need a higher plan to continue creating.',
  },
  {
    question: 'How does team billing work?',
    answer:
      "Plans are billed per team. Each team member is counted toward your plan's member limit. You can manage members from your team settings.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We use Stripe for payments. You can pay with any major credit or debit card. Invoices are available in your billing portal.',
  },
];

type FaqSectionProps = {
  faqs?: FaqItem[];
};

export function FaqSection({ faqs = defaultFaqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground">
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
                  <span className="text-base font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`ml-4 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </dt>
              {isOpen && (
                <dd className="mt-2 pr-12 text-sm text-muted-foreground">{faq.answer}</dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
