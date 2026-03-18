import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authCallbacks } from "@/shared/lib/auth/callbacks";
import { authEvents } from "@/shared/lib/auth/events";
import { db } from "@/shared/lib/db/prisma";
import { getAuthProviders } from "@/shared/lib/auth/providers";

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (instead of default 30 days)
    updateAge: 60 * 60, // Refresh every hour
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: getAuthProviders(),
  callbacks: {
    ...authCallbacks,
    async redirect({ url, baseUrl }) {
      // Prevent open redirect attacks
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: authEvents,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
