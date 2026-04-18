import { describe, expect, it } from "vitest";

import {
  buildVisitorCookieHeader,
  generateVisitorId,
  readVisitorIdFromCookieHeader,
  VISITOR_COOKIE_MAX_AGE_SECONDS,
  VISITOR_COOKIE_NAME,
} from "@/features/agents/server/visitor";

describe("public chat visitor cookie", () => {
  it("generates an opaque v_-prefixed id without hyphens", () => {
    const id = generateVisitorId();
    expect(id).toMatch(/^v_[0-9a-f]{32}$/);
  });

  it("builds a cross-site cookie header with SameSite=None; Secure; HttpOnly", () => {
    const header = buildVisitorCookieHeader("v_abc");
    expect(header).toContain(`${VISITOR_COOKIE_NAME}=v_abc`);
    expect(header).toContain(`Max-Age=${VISITOR_COOKIE_MAX_AGE_SECONDS}`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=None");
    expect(header).toContain("Path=/");
  });

  it("round-trips through a cookie header", () => {
    const header = buildVisitorCookieHeader("v_roundtrip");
    const cookieLine = header
      .split(";")[0]
      .trim();
    expect(readVisitorIdFromCookieHeader(cookieLine)).toBe("v_roundtrip");
  });

  it("finds the visitor id alongside other cookies", () => {
    const other = `foo=bar; ${VISITOR_COOKIE_NAME}=v_xyz; baz=qux`;
    expect(readVisitorIdFromCookieHeader(other)).toBe("v_xyz");
  });

  it("returns null when the cookie is missing or empty", () => {
    expect(readVisitorIdFromCookieHeader(null)).toBeNull();
    expect(readVisitorIdFromCookieHeader("")).toBeNull();
    expect(readVisitorIdFromCookieHeader("other=1")).toBeNull();
    expect(readVisitorIdFromCookieHeader(`${VISITOR_COOKIE_NAME}=`)).toBeNull();
  });
});
