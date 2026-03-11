import { ActivityType } from '@/lib/db/generated/client/client';
import type {
  ActivityLog,
  Invitation,
  Prisma,
  TeamRole,
  Team,
  TeamMember,
  User
} from '@/lib/db/generated/client/client';

export type { ActivityLog, Invitation, Team, TeamMember, TeamRole, User };
export { ActivityType };

export type NewUser = Prisma.UserCreateInput;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};
