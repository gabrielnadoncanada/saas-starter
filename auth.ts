import { authorizeWithCredentials } from '@/lib/auth/credentials';
import { logUserSignIn } from '@/lib/auth/activity';
import { linkOAuthAccountToUser } from '@/lib/auth/linked-accounts';
import { resolveOAuthUser } from '@/lib/auth/oauth';
import { getAuthProviders } from '@/lib/auth/providers';
import { db } from '@/lib/db/prisma';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/sign-in'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        return authorizeWithCredentials(credentials as Record<string, string> | undefined);
      }
    }),
    ...getAuthProviders()
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      if (account.provider === 'credentials') {
        if (!user.id) {
          return false;
        }

        await logUserSignIn(Number(user.id));
        return true;
      }

      const email = user.email?.trim();

      if (!email || !account.providerAccountId) {
        return '/sign-in?error=OAuthSignin';
      }

      const currentSession = await auth();
      const currentUserId = Number(currentSession?.user?.id);

      if (Number.isInteger(currentUserId) && currentUserId > 0) {
        const currentUser = await db.user.findUnique({
          where: {
            id: currentUserId
          }
        });

        if (!currentUser || currentUser.deletedAt) {
          return '/sign-in?error=OAuthSignin';
        }

        const linkResult = await linkOAuthAccountToUser({
          userId: currentUser.id,
          provider: account.provider as 'google' | 'github',
          providerAccountId: account.providerAccountId,
          accountType: account.type
        });

        if (linkResult.status === 'conflict') {
          return `/dashboard/security?error=ProviderAlreadyLinked&provider=${account.provider}`;
        }

        if (linkResult.status === 'provider-already-linked') {
          return `/dashboard/security?error=ProviderAlreadyOnAccount&provider=${account.provider}`;
        }

        user.id = String(currentUser.id);
        user.email = currentUser.email;
        user.name = currentUser.name;
        user.role = currentUser.role;

        return true;
      }

      const linkedUser = await resolveOAuthUser({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        accountType: account.type,
        email,
        name: user.name ?? null,
        profile: (profile ?? null) as Record<string, unknown> | null
      });

      if (!linkedUser) {
        return '/sign-in?error=OAuthAccountNotLinked';
      }

      user.id = String(linkedUser.id);
      user.email = linkedUser.email;
      user.name = linkedUser.name;
      user.role = linkedUser.role;

      await logUserSignIn(linkedUser.id);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : token.sub ?? '';
        session.user.role = typeof token.role === 'string' ? token.role : undefined;
      }

      return session;
    }
  }
};

export async function auth() {
  return getServerSession(authOptions);
}
