"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionProps = {
  items: FaqItem[];
};

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-3xl border-y border-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className={cn(
              "group border-b border-border last:border-b-0 transition-colors",
              isOpen && "bg-muted/30",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-start justify-between gap-6 px-2 py-6 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-start gap-6">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground tabular-nums pt-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "text-base font-medium tracking-[-0.01em] transition-colors md:text-lg",
                    isOpen ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {item.question}
                </span>
              </div>
              <span
                className={cn(
                  "mt-1 flex size-7 shrink-0 items-center justify-center border transition-all",
                  isOpen
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-background text-muted-foreground group-hover:border-foreground",
                )}
                aria-hidden
              >
                {isOpen ? (
                  <Minus className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <Plus className="size-3.5" strokeWidth={2.5} />
                )}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pl-14 pr-12 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
