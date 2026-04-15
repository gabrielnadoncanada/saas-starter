import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative border border-border bg-card">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
      />
      <div className="space-y-1.5 border-b border-border px-6 py-5 md:px-7">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">{eyebrow}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="px-6 py-6 md:px-7">{children}</div>
      {footer ? (
        <div className="border-t border-border bg-muted/30 px-6 py-4 md:px-7">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
