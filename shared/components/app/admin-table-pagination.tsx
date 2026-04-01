"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type AdminTablePaginationProps = {
  currentPage: number;
  disabled: boolean;
  offset: number;
  onChange: (offset: number) => void;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function AdminTablePagination({
  currentPage,
  disabled,
  offset,
  onChange,
  pageSize,
  total,
  totalPages,
}: AdminTablePaginationProps) {
  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + pageSize, total);

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <PaginationButton
          disabled={offset === 0 || disabled}
          onClick={() => onChange(0)}
        >
          <ChevronsLeft className="size-4" />
        </PaginationButton>
        <PaginationButton
          disabled={offset === 0 || disabled}
          onClick={() => onChange(Math.max(0, offset - pageSize))}
        >
          <ChevronLeft className="size-4" />
        </PaginationButton>
        <PaginationButton
          disabled={offset + pageSize >= total || disabled}
          onClick={() => onChange(offset + pageSize)}
        >
          <ChevronRight className="size-4" />
        </PaginationButton>
        <PaginationButton
          disabled={offset + pageSize >= total || disabled}
          onClick={() => onChange((totalPages - 1) * pageSize)}
        >
          <ChevronsRight className="size-4" />
        </PaginationButton>
      </div>
      <span>
        Showing {showingFrom} to {showingTo} of {total} rows
      </span>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
