import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authCallbacks } from "@/lib/auth/callbacks";
import { authEvents } from "@/lib/auth/events";
import { db } from "@/lib/db/prisma";
import { getAuthProviders } from "@/lib/auth/providers";

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
