import { cn } from "@/lib/utils";

type PageProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  fluid?: boolean;
  ref?: React.ComponentProps<"div">["ref"];
};

function Page({ fixed, className, fluid, ...props }: PageProps) {
  return (
    <div
      data-layout={fixed ? "fixed" : undefined}
      className={cn(
        "p-6 flex flex-1 flex-col gap-6 sm:gap-8",
        fixed && "flex grow flex-col overflow-hidden max-h-dvh",
        !fluid && "flex min-w-0 flex-1 flex-col",
        className,
      )}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-title"
      className={cn(
        "text-2xl font-semibold tracking-[-0.025em] md:text-3xl",
        className,
      )}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-description"
      className={cn("max-w-2xl text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function PageHeaderActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start",
        className,
      )}
      {...props}
    />
  );
}

type PageHeaderProps = React.ComponentProps<"div"> & {
  eyebrow?: string;
};

function PageHeader({
  className,
  eyebrow,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      {eyebrow ? (
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-1.5 bg-brand" />
          <span className="label-mono">{eyebrow}</span>
        </div>
      ) : null}
      <div
        data-slot="page-header"
        className={cn(
          "gap-x-2 grid auto-rows-min items-start justify-between has-data-[slot=page-header-actions]:grid-cols-[1fr_auto] has-data-[slot=page-description]:grid-rows-[auto_auto]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export { Page, PageDescription, PageHeader, PageHeaderActions, PageTitle };
