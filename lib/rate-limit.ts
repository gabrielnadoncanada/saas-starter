import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

import { getCurrentUser } from "@/lib/auth/get-current-user";

const PRESETS = {
  ai: { limit: 20, window: "1 m" },
  action: { limit: 10, window: "10 s" },
  public: { limit: 60, window: "1 m" },
  checkout: { limit: 5, window: "1 h" },
} as const;

export type RateLimitPreset = keyof typeof PRESETS;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
};

let cachedRedis: Redis | null | undefined;
const limiterCache = new Map<RateLimitPreset, Ratelimit>();

function getRedisClient(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting disabled.",
      );
    }
    cachedRedis = null;
    return null;
  }

  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

function getLimiter(preset: RateLimitPreset): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const cached = limiterCache.get(preset);
  if (cached) return cached;

  const cfg = PRESETS[preset];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
    analytics: true,
    prefix: `ratelimit:${preset}`,
  });
  limiterCache.set(preset, limiter);
  return limiter;
}

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  return h.get("x-real-ip");
}

export async function resolveIdentity(): Promise<string> {
  const user = await getCurrentUser();
  if (user) return `user:${user.id}`;
  const ip = await getClientIp();
  return `ip:${ip ?? "unknown"}`;
}

export async function rateLimit(
  preset: RateLimitPreset,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(preset);

  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0, retryAfterSeconds: 0 };
  }

  const result = await limiter.limit(identifier);
  const retryAfterSeconds = result.success
    ? 0
    : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfterSeconds,
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
  if (!result.success) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }
  return headers;
}

export async function enforceActionRateLimit(
  preset: RateLimitPreset,
): Promise<{ error: string } | null> {
  const identifier = await resolveIdentity();
  const result = await rateLimit(preset, identifier);
  if (result.success) return null;
  return {
    error: `Too many requests. Try again in ${result.retryAfterSeconds}s.`,
  };
}
