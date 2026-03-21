import 'server-only'

import { getAuthSession } from '@/shared/lib/auth/get-session'

/**
 * Returns the active organization ID from the current session.
 * The better-auth organization plugin stores this in the session directly.
 */
export async function getActiveOrganizationId(): Promise<string | null> {
  const session = await getAuthSession()

  return session?.session.activeOrganizationId ?? null
}
