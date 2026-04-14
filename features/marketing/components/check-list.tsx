import { Check } from "lucide-react";

export function CheckList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <span className="text-sm sm:text-base">{item}</span>
        </div>
      ))}
    </div>
  );
}
