import { dash } from "@better-auth/infra";
import { createElement } from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { stripe } from "@better-auth/stripe";
import { admin, magicLink } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { stripePlans } from "@/shared/config/billing.config";
import { accountFlags } from "@/shared/config/account.config";
import { db } from "@/shared/lib/db/prisma";
import { sendEmail } from "@/shared/lib/email/client";
import { VerifyEmailTemplate } from "@/shared/lib/email/templates/verify-email";
import { ResetPasswordTemplate } from "@/shared/lib/email/templates/reset-password";
import { MagicLinkEmail } from "@/shared/lib/email/templates/magic-link";
import { sendTeamInvitationEmail } from "@/shared/lib/email/senders";
import { stripe as stripeClient } from "@/shared/lib/stripe/client";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.BASE_URL,
  basePath: "/api/auth",
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
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
      adminRoles: ["admin"],
    }),
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
    organization({
      allowUserToCreateOrganization: accountFlags.allowCreateOrganization,
      creatorRole: "owner",
      invitationExpiresIn: 7 * 24 * 60 * 60,
      sendInvitationEmail: async ({ invitation, organization: org, inviter }) => {
        await sendTeamInvitationEmail({
          email: invitation.email,
          role: invitation.role,
          inviterName: inviter.user.name || inviter.user.email,
          organizationName: org.name,
          invitationToken: invitation.id,
        });
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      subscription: {
        enabled: true,
        plans: stripePlans,
        authorizeReference: async ({ user, referenceId }) => {
          const member = await db.member.findFirst({
            where: {
              organizationId: referenceId,
              userId: user.id,
            },
            select: {
              role: true,
            },
          });

          return member?.role === "owner";
        },
        getCheckoutSessionParams: async () => ({
          params: {
            allow_promotion_codes: true,
          },
        }),
      },
      organization: {
        enabled: true,
      },
    }),
    nextCookies(),
  ],
});

export type Auth = typeof auth;

