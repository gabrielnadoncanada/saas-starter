import { Check } from "lucide-react";

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm">
          <span
            aria-hidden
            className="mt-0.5 flex size-4 shrink-0 items-center justify-center border border-brand bg-brand-soft"
          >
            <Check className="size-3 text-brand" strokeWidth={2.5} />
          </span>
          <span className="leading-relaxed text-foreground/90">{item}</span>
        </li>
      ))}
    </ul>
  );
}
