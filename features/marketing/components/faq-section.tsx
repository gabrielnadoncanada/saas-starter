"use client";

import { Minus, Plus } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionProps = {
  items: FaqItem[];
};

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-0"
      className="mx-auto w-full max-w-3xl border-y"
    >
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`item-${index}`}
          className="group transition-colors data-[state=open]:bg-muted/30"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-6 px-2 py-6 text-left outline-none">
              <span className="pt-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-base font-medium tracking-[-0.01em] text-foreground/80 transition-colors group-data-[state=open]:text-foreground md:text-lg">
                {item.question}
              </span>
              <span
                aria-hidden
                className="mt-1 flex size-7 items-center justify-center border bg-background text-muted-foreground transition-all group-hover:border-foreground group-data-[state=open]:border-brand group-data-[state=open]:bg-brand group-data-[state=open]:text-brand-foreground"
              >
                <Plus
                  className="size-3.5 group-data-[state=open]:hidden"
                  strokeWidth={2.5}
                />
                <Minus
                  className="hidden size-3.5 group-data-[state=open]:block"
                  strokeWidth={2.5}
                />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionContent className="pb-6 pl-14 pr-12 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
