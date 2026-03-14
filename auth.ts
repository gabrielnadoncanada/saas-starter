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
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: getAuthProviders(),
  callbacks: authCallbacks,
  events: authEvents,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
