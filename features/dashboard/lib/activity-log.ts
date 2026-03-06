import {
  AlertCircle,
  CheckCircle,
  Link2,
  Lock,
  LogOut,
  Mail,
  Settings,
  Unlink2,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon
} from 'lucide-react';

import { db } from '@/lib/db/prisma';
import { getCurrentUser } from '@/features/auth/lib/current-user';

export const activityIconMap: Record<string, LucideIcon> = {
  SIGN_UP: UserPlus,
  SIGN_IN: UserCog,
  SIGN_OUT: LogOut,
  UPDATE_PASSWORD: Lock,
  DELETE_ACCOUNT: UserMinus,
  UPDATE_ACCOUNT: Settings,
  CREATE_TEAM: UserPlus,
  REMOVE_TEAM_MEMBER: UserMinus,
  INVITE_TEAM_MEMBER: Mail,
  ACCEPT_INVITATION: CheckCircle,
  LINK_AUTH_PROVIDER: Link2,
  UNLINK_AUTH_PROVIDER: Unlink2
};

export const emptyActivityIcon = AlertCircle;

export async function getActivityLogs() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const logs = await db.activityLog.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 10
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    userName: log.user?.name ?? null
  }));
}

export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

export function formatActivityAction(action: string) {
  switch (action) {
    case 'SIGN_UP':
      return 'You signed up';
    case 'SIGN_IN':
      return 'You signed in';
    case 'SIGN_OUT':
      return 'You signed out';
    case 'UPDATE_PASSWORD':
      return 'You changed your password';
    case 'DELETE_ACCOUNT':
      return 'You deleted your account';
    case 'UPDATE_ACCOUNT':
      return 'You updated your account';
    case 'CREATE_TEAM':
      return 'You created a new team';
    case 'REMOVE_TEAM_MEMBER':
      return 'You removed a team member';
    case 'INVITE_TEAM_MEMBER':
      return 'You invited a team member';
    case 'ACCEPT_INVITATION':
      return 'You accepted an invitation';
    case 'LINK_AUTH_PROVIDER':
      return 'You linked a sign-in provider';
    case 'UNLINK_AUTH_PROVIDER':
      return 'You unlinked a sign-in provider';
    default:
      return 'Unknown action occurred';
  }
}
