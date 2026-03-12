import { getActiveTeamId } from '@/features/teams/server/active-team'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { db } from '@/lib/db/prisma'

export async function getCurrentTeam() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return getTeamForUser(user.id)
}

export async function getTeamForUser(userId: number) {
  const activeTeamId = await getActiveTeamId()
  const memberships = await db.teamMember.findMany({
    where: { userId },
    orderBy: { joinedAt: 'asc' },
    select: { teamId: true },
  })

  const selectedTeamId =
    memberships.find((membership) => membership.teamId === activeTeamId)?.teamId ??
    memberships[0]?.teamId

  if (!selectedTeamId) {
    return null
  }

  return db.team.findUnique({
    where: { id: selectedTeamId },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })
}
