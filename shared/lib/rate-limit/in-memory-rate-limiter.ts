/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Trade-offs:
 * - Not shared across instances (fine for single-process / single-server)
 * - State is lost on restart (acceptable for rate limiting)
 * - Automatic cleanup of stale entries to prevent memory leaks
 */

type RateLimitEntry = {
  timestamps: number[];
};

type RateLimiterConfig = {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
};

const CLEANUP_INTERVAL_MS = 60_000; // Clean stale entries every minute

export function createRateLimiter(config: RateLimiterConfig) {
  const store = new Map<string, RateLimitEntry>();
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

    lastCleanup = now;
    const cutoff = now - config.windowMs;

    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }

  function check(key: string): RateLimitResult {
    cleanup();

    const now = Date.now();
    const cutoff = now - config.windowMs;

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= config.maxRequests) {
      const oldestInWindow = entry.timestamps[0]!;
      const retryAfterMs = oldestInWindow + config.windowMs - now;

      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, retryAfterMs),
      };
    }

    entry.timestamps.push(now);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.timestamps.length,
      retryAfterMs: null,
    };
  }

  return { check };
}
