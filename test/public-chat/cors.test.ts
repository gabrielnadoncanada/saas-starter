import { afterEach, describe, expect, it } from "vitest";

import {
  corsHeaders,
  resolveAllowedOrigin,
} from "@/features/agents/server/cors";

const ENV_KEY = "PUBLIC_CHAT_ALLOWED_ORIGINS";

describe("public chat CORS", () => {
  const originalValue = process.env[ENV_KEY];

  afterEach(() => {
    if (originalValue === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = originalValue;
  });

  it("rejects unknown origins", () => {
    process.env[ENV_KEY] = "https://foo.example, https://bar.example";
    expect(resolveAllowedOrigin("https://evil.example")).toBeNull();
  });

  it("allows a listed origin", () => {
    process.env[ENV_KEY] = "https://foo.example, https://bar.example";
    expect(resolveAllowedOrigin("https://bar.example")).toBe(
      "https://bar.example",
    );
  });

  it("echoes any origin when wildcard is configured", () => {
    process.env[ENV_KEY] = "*";
    expect(resolveAllowedOrigin("https://anything.example")).toBe(
      "https://anything.example",
    );
  });

  it("returns null when no origin header is present", () => {
    process.env[ENV_KEY] = "*";
    expect(resolveAllowedOrigin(null)).toBeNull();
  });

  it("returns empty headers when origin is not allowed", () => {
    expect(corsHeaders(null)).toEqual({});
  });

  it("emits credential-bearing CORS headers with Vary: Origin when allowed", () => {
    const h = corsHeaders("https://foo.example") as Record<string, string>;
    expect(h["Access-Control-Allow-Origin"]).toBe("https://foo.example");
    expect(h["Access-Control-Allow-Credentials"]).toBe("true");
    expect(h.Vary).toBe("Origin");
    expect(h["Access-Control-Allow-Methods"]).toContain("POST");
  });
});
