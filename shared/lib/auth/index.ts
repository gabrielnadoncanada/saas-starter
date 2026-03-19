import "server-only";

import { createElement } from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/shared/lib/db/prisma";
import { sendEmail } from "@/shared/lib/email/client";
import { VerifyEmailTemplate } from "@/shared/lib/email/templates/verify-email";
import { ResetPasswordTemplate } from "@/shared/lib/email/templates/reset-password";
import { MagicLinkEmail } from "@/shared/lib/email/templates/magic-link";
import { logUserSignIn } from "@/shared/lib/auth/activity";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.BASE_URL,
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: [user.email],
        subject: "Réinitialisez votre mot de passe",
        react: createElement(ResetPasswordTemplate, { resetUrl: url }),
        text: `Réinitialisez votre mot de passe : ${url}`,
        tags: [{ name: "email_type", value: "reset_password" }],
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: [user.email],
        subject: "Confirmez votre adresse email",
        react: createElement(VerifyEmailTemplate, { verificationUrl: url }),
        text: `Confirmez votre adresse email : ${url}`,
        tags: [{ name: "email_type", value: "verify_email" }],
      });
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },

  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // Refresh every hour
  },

  account: {
    accountLinking: {
      enabled: process.env.ALLOW_EMAIL_ACCOUNT_LINKING === "true",
      trustedProviders: ["google", "github"],
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: [email],
          subject: "Votre lien de connexion",
          react: createElement(MagicLinkEmail, { url }),
          text: `Votre lien de connexion : ${url}`,
          tags: [{ name: "email_type", value: "magic_link" }],
        });
      },
    }),
    nextCookies(),
  ],

  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await logUserSignIn(session.userId).catch(() => {});
        },
      },
    },
  },
});

export type Auth = typeof auth;
