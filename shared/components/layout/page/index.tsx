import { cn } from "@/shared/lib/utils";

type PageProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  fluid?: boolean;
  ref?: React.Ref<HTMLElement>;
};

function Page({ fixed, className, fluid, ...props }: PageProps) {
  return (
    <main
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "px-4 py-6 flex flex-1 flex-col gap-4 sm:gap-6",
        fixed && "flex grow flex-col overflow-hidden",
        !fluid &&
          "@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}

function PageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-title"
      className={cn("text-2xl font-bold tracking-tight", className)}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-description"
      className={cn("text-muted-foreground", className)}
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
      className={cn("col-start-2 row-span-2 row-start-1", className)}
      {...props}
    />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "gap-x-2 grid auto-rows-min items-start justify-between has-data-[slot=page-header-actions]:grid-cols-[1fr_auto] has-data-[slot=page-description]:grid-rows-[auto_auto]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Page,
  PageContent,
  PageTitle,
  PageDescription,
  PageHeaderActions,
  PageHeader,
};
