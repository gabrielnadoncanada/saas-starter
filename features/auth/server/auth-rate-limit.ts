import { createRateLimiter } from "@/shared/lib/rate-limit/in-memory-rate-limiter";

export const signInRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
});

export const signUpRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
});

export const resendVerificationRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
});

export const forgotPasswordRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000,
});
