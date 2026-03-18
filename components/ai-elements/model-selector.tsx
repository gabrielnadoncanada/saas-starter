"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps, HTMLAttributes } from "react";

const logos: Record<string, string> = {
  google: "G",
  groq: "Q",
};

export const ModelSelector = (props: ComponentProps<typeof Dialog>) => <Dialog {...props} />;
export const ModelSelectorTrigger = (props: ComponentProps<typeof DialogTrigger>) => <DialogTrigger {...props} />;
export const ModelSelectorContent = ({ children, className, ...props }: ComponentProps<typeof DialogContent>) => (
  <DialogContent className={cn("gap-0 overflow-hidden p-0", className)} {...props}>
    <Command>{children}</Command>
  </DialogContent>
);
export const ModelSelectorInput = (props: ComponentProps<typeof CommandInput>) => <CommandInput {...props} />;
export const ModelSelectorList = (props: ComponentProps<typeof CommandList>) => <CommandList {...props} />;
export const ModelSelectorEmpty = (props: ComponentProps<typeof CommandEmpty>) => <CommandEmpty {...props} />;
export const ModelSelectorGroup = (props: ComponentProps<typeof CommandGroup>) => <CommandGroup {...props} />;
export const ModelSelectorItem = (props: ComponentProps<typeof CommandItem>) => <CommandItem {...props} />;
export const ModelSelectorLogoGroup = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("ml-auto flex items-center gap-1", className)} {...props} />
);
export const ModelSelectorName = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("truncate", className)} {...props} />
);
export function ModelSelectorLogo({
  className,
  provider,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { provider: string }) {
  return (
    <div
      className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase", className)}
      {...props}
    >
      {logos[provider] ?? provider.slice(0, 1)}
    </div>
  );
}
