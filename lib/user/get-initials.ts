export function getInitials(user: {
  name?: string | null;
  email?: string | null;
}): string {
  const source = user.name?.trim() || user.email?.trim() || "";
  const parts = source.split(/\s+|@/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
