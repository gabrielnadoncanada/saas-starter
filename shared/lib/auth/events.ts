import type { NextAuthConfig } from "next-auth";
import { ActivityType } from "@prisma/client";
import {
  logLinkedAuthProvider,
  logUserSignIn,
} from "@/shared/lib/auth/activity";

export const authEvents: NextAuthConfig["events"] = {
  async signIn({ user }) {
    const userId = Number(user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return;
    }

    await logUserSignIn(userId);
  },

  async linkAccount({ user, account }) {
    if (account.provider === "resend") {
      return;
    }

    const userId = Number(user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return;
    }

    await logLinkedAuthProvider(userId, ActivityType.LINK_AUTH_PROVIDER);
  },
};
