import { ActivityType } from '@prisma/client';
import type {
  ActivityLog,
  Invitation,
  Prisma,
  Team,
  TeamMember,
  User
} from '@prisma/client';

export type { ActivityLog, Invitation, Team, TeamMember, User };
export { ActivityType };

export type NewUser = Prisma.UserCreateInput;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};
