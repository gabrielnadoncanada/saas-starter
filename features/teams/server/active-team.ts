import 'server-only'

import { cookies } from 'next/headers'
import { db } from '@/shared/lib/db/prisma'

const ACTIVE_TEAM_COOKIE = 'active_team_id'

export async function getActiveTeamId() {
  const cookieStore = await cookies()
  const value = Number(cookieStore.get(ACTIVE_TEAM_COOKIE)?.value)

  return Number.isInteger(value) && value > 0 ? value : null
}

export async function setActiveTeamId(userId: number, teamId: number) {
  const membership = await db.teamMember.findFirst({
    where: { userId, teamId },
    select: { id: true },
  })

  if (!membership) {
    throw new Error('User is not a member of this team')
  }

  const cookieStore = await cookies()

  cookieStore.set(ACTIVE_TEAM_COOKIE, String(teamId), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
