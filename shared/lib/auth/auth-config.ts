import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins";
import { createElement } from "react";

import { accountFlags } from "@/shared/config/account.config";
import { PLATFORM_ADMIN_ROLES } from "@/shared/lib/auth/roles";
import { db } from "@/shared/lib/db/prisma";
import { sendEmail } from "@/shared/lib/email/client";
import { sendTeamInvitationEmail } from "@/shared/lib/email/senders";
import { MagicLinkEmail } from "@/shared/lib/email/templates/magic-link";
import { ResetPasswordTemplate } from "@/shared/lib/email/templates/reset-password";
import { VerifyEmailTemplate } from "@/shared/lib/email/templates/verify-email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.BASE_URL,
  basePath: "/api/auth",
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        returned: true,
      },
      phoneNumber: {
        type: "string",
        required: false,
        returned: true,
      },
      preferredLocale: {
        type: "string",
        required: false,
        returned: true,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        returned: true,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: [user.email],
        subject: "Reset your password",
        react: createElement(ResetPasswordTemplate, { resetUrl: url }),
        text: `Reset your password: ${url}`,
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
        subject: "Verify your email address",
        react: createElement(VerifyEmailTemplate, { verificationUrl: url }),
        text: `Verify your email address: ${url}`,
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
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
  },

  account: {
    accountLinking: {
      enabled: process.env.ALLOW_EMAIL_ACCOUNT_LINKING === "true",
      trustedProviders: ["google", "github"],
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: [...PLATFORM_ADMIN_ROLES],
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: [email],
          subject: "Your sign-in link",
          react: createElement(MagicLinkEmail, { url }),
          text: `Your sign-in link: ${url}`,
          tags: [{ name: "email_type", value: "magic_link" }],
        });
      },
    }),
    organization({
      allowUserToCreateOrganization: accountFlags.allowCreateOrganization,
      creatorRole: "owner",
      invitationExpiresIn: 7 * 24 * 60 * 60,
      sendInvitationEmail: async ({
        invitation,
        organization: org,
        inviter,
      }) => {
        await sendTeamInvitationEmail({
          email: invitation.email,
          role: invitation.role,
          inviterName: inviter.user.name || inviter.user.email,
          organizationName: org.name,
          invitationToken: invitation.id,
        });
      },
    }),
    twoFactor({
      issuer: "SaaS Starter",
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
