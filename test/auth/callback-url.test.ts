import { describe, expect, it } from "vitest";

import { buildCallbackURL, getCallbackURL } from "@/shared/lib/auth/callback-url";

describe("callback-url", () => {
  it("keeps allowed localized callback urls", () => {
    expect(getCallbackURL("/fr/dashboard")).toBe("/fr/dashboard");
    expect(getCallbackURL("/fr/accept-invitation/inv_123")).toBe(
      "/fr/accept-invitation/inv_123",
    );
  });

  it("rejects unknown callback urls", () => {
    expect(getCallbackURL("/fr/settings")).toBe("/post-sign-in");
    expect(getCallbackURL("https://evil.example")).toBe("/post-sign-in");
  });

  it("builds callback urls only for allowed destinations", () => {
    expect(buildCallbackURL("/sign-in", "/fr/dashboard")).toBe(
      "/sign-in?callbackUrl=%2Ffr%2Fdashboard",
    );
    expect(buildCallbackURL("/sign-in", "/fr/settings")).toBe("/sign-in");
  });
});
