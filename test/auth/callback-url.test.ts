import { describe, expect, it } from "vitest";

import {
  buildCallbackURL,
  getCallbackURL,
} from "@/shared/lib/auth/callback-url";

describe("callback-url", () => {
  it("keeps allowed callback urls", () => {
    expect(getCallbackURL("/dashboard")).toBe("/dashboard");
    expect(getCallbackURL("/accept-invitation/inv_123")).toBe(
      "/accept-invitation/inv_123",
    );
  });

  it("rejects unknown callback urls", () => {
    expect(getCallbackURL("/settings")).toBe("/post-sign-in");
    expect(getCallbackURL("https://evil.example")).toBe("/post-sign-in");
  });

  it("builds callback urls only for allowed destinations", () => {
    expect(buildCallbackURL("/sign-in", "/dashboard")).toBe(
      "/sign-in?callbackUrl=%2Fdashboard",
    );
    expect(buildCallbackURL("/sign-in", "/settings")).toBe("/sign-in");
  });
});
