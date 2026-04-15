import { format, parseISO } from "date-fns";

type DateLike = Date | string | number | null | undefined;

function toDate(value: DateLike): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return parseISO(value);
}

export function formatShortDate(value: DateLike): string | null {
  const date = toDate(value);
  return date ? format(date, "MMM d, yyyy") : null;
}

export function formatLongDate(value: DateLike): string | null {
  const date = toDate(value);
  return date ? format(date, "MMMM d, yyyy") : null;
}

export function formatMonthDay(value: DateLike): string | null {
  const date = toDate(value);
  return date ? format(date, "MMM d") : null;
}

export function formatMonthYear(value: DateLike): string | null {
  const date = toDate(value);
  return date ? format(date, "MMM yyyy") : null;
}
