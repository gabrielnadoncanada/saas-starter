import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { ActivityType } from '@/lib/db/types';
import { db } from '@/lib/db/prisma';
import { getAuthProviders } from '@/lib/auth/providers';
import { getUserTeamId, logAuthActivity, logUserSignIn } from '@/features/auth/server/auth-activity';

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/sign-in'
  },
  providers: getAuthProviders(),
  callbacks: {
    async signIn({ user }) {
      const userId = Number(user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return true;
      }

      const existingUser = await db.user.findUnique({
        where: { id: userId },
        select: { deletedAt: true }
      });

      if (existingUser?.deletedAt) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = String(user.id);
        token.id = String(user.id);
        token.platformRole =
          typeof user.platformRole === 'string' ? user.platformRole : undefined;
      }

      if (!token.sub) {
        return token;
      }

      const currentUser = await db.user.findUnique({
        where: { id: Number(token.sub) },
        select: {
          deletedAt: true,
          platformRole: true
        }
      });

      if (!currentUser || currentUser.deletedAt) {
        return null;
      }

      token.id = token.sub;
      token.platformRole = currentUser.platformRole;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : token.sub ?? '';
        session.user.platformRole =
          typeof token.platformRole === 'string' ? token.platformRole : undefined;
      }

      return session;
    }
  },
  events: {
    async signIn({ user }) {
      const userId = Number(user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return;
      }

      await logUserSignIn(userId);
    },
    async linkAccount({ user, account }) {
      if (account.provider === 'resend') {
        return;
      }

      const userId = Number(user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return;
      }

      const teamId = await getUserTeamId(userId);
      await logAuthActivity(teamId, userId, ActivityType.LINK_AUTH_PROVIDER);
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
