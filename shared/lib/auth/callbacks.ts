import type { NextAuthConfig } from "next-auth";
import { getActiveAuthUserById } from "@/shared/lib/auth/active-user";

export const authCallbacks: NextAuthConfig["callbacks"] = {
  async signIn({ user }) {
    const userId = Number(user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return true;
    }

    const activeUser = await getActiveAuthUserById(userId);

    if (!activeUser) {
      return false;
    }

    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      token.sub = user.id;
      token.id = user.id;
      token.platformRole =
        typeof user.platformRole === "string" ? user.platformRole : undefined;
    }

    if (!token.sub) {
      return token;
    }

    const activeUser = await getActiveAuthUserById(Number(token.sub));

    if (!activeUser) {
      return null;
    }

    token.id = String(activeUser.id);
    token.platformRole = activeUser.platformRole;

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id =
        typeof token.id === "string" ? token.id : (token.sub ?? "");

      session.user.platformRole =
        typeof token.platformRole === "string" ? token.platformRole : undefined;
    }

    return session;
  },
};
