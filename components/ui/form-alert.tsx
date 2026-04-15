import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormAlertTone = "destructive" | "success";

type FormAlertProps = {
  tone?: FormAlertTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const toneContainerClasses: Record<FormAlertTone, string> = {
  destructive: "border-destructive/40 bg-destructive/5",
  success: "border-brand/30 bg-brand/5",
};

export function FormAlert({
  tone = "destructive",
  icon,
  children,
  className,
}: FormAlertProps) {
  const resolvedIcon =
    icon ??
    (tone === "success" ? (
      <CheckCircle2
        className="mt-0.5 size-4 shrink-0 text-brand"
        strokeWidth={1.75}
      />
    ) : null);

  if (resolvedIcon) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 border px-4 py-3",
          toneContainerClasses[tone],
          className,
        )}
      >
        {resolvedIcon}
        <p className="text-sm">{children}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border px-3 py-2 text-sm",
        toneContainerClasses[tone],
        tone === "destructive" && "text-destructive",
        className,
      )}
    >
      {children}
    </div>
  );
}
