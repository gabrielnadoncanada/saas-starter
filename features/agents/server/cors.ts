import "server-only";

/**
 * Public chat endpoints are called from third-party customer websites, so they
 * need CORS. We only allow origins listed in PUBLIC_CHAT_ALLOWED_ORIGINS
 * (comma-separated). Wildcard "*" is supported for dev but must not be used in
 * production with credentials.
 */
function getAllowedOrigins(): string[] {
  const raw = process.env.PUBLIC_CHAT_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function resolveAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  const allowed = getAllowedOrigins();
  if (allowed.includes("*")) return requestOrigin;
  return allowed.includes(requestOrigin) ? requestOrigin : null;
}

export function corsHeaders(allowedOrigin: string | null): HeadersInit {
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
