import "server-only";

import { randomUUID } from "crypto";

export const VISITOR_COOKIE_NAME = "pc_visitor";
export const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function generateVisitorId(): string {
  return `v_${randomUUID().replace(/-/g, "")}`;
}

/**
 * Build the Set-Cookie header string for the visitor cookie. SameSite=None +
 * Secure is required because the widget lives on third-party sites and sends
 * the cookie cross-site to our endpoint.
 */
export function buildVisitorCookieHeader(visitorId: string): string {
  return [
    `${VISITOR_COOKIE_NAME}=${visitorId}`,
    "Path=/",
    `Max-Age=${VISITOR_COOKIE_MAX_AGE_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ].join("; ");
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
