import "server-only";

import { randomUUID } from "crypto";

export const VISITOR_COOKIE_NAME = "pc_visitor";
export const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function generateVisitorId(): string {
  return `v_${randomUUID().replace(/-/g, "")}`;
}

/**
 * Build the Set-Cookie header string for the visitor cookie. SameSite=None +
 * Secure is required in production because the widget lives on third-party
 * sites and sends the cookie cross-site. On http://localhost the browser
 * rejects Secure cookies, so we fall back to Lax in development.
 */
export function buildVisitorCookieHeader(visitorId: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${VISITOR_COOKIE_NAME}=${visitorId}`,
    "Path=/",
    `Max-Age=${VISITOR_COOKIE_MAX_AGE_SECONDS}`,
    "HttpOnly",
  ];
  if (isProd) {
    parts.push("Secure", "SameSite=None");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

export function readVisitorIdFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === VISITOR_COOKIE_NAME) {
      return rest.join("=").trim() || null;
    }
  }
  return null;
}
