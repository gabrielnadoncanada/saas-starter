/** Normalize optional date-like values to ISO strings for client-safe views. */
export function toIsoString(value?: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}
