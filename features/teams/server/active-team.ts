import 'server-only'

import { cookies } from 'next/headers'

const ACTIVE_TEAM_COOKIE = 'active_team_id'

export async function getActiveTeamId() {
  const cookieStore = await cookies()
  const value = Number(cookieStore.get(ACTIVE_TEAM_COOKIE)?.value)

  return Number.isInteger(value) && value > 0 ? value : null
}

export async function setActiveTeamId(teamId: number) {
  const cookieStore = await cookies()

  cookieStore.set(ACTIVE_TEAM_COOKIE, String(teamId), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
