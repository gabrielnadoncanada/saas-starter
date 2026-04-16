import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { CurrentUser } from "@/lib/auth/get-current-user";

export function identifySentryUser(user: CurrentUser | null | undefined) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
  });
}

export function captureServerError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
