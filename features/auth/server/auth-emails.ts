import { createElement } from "react";
import { getAppBaseUrl } from "@/shared/lib/email/config";
import { sendEmail } from "@/shared/lib/email/client";
import { PasswordChangedTemplate } from "@/shared/lib/email/templates/password-changed";
import { ResetPasswordTemplate } from "@/shared/lib/email/templates/reset-password";
import { VerifyEmailTemplate } from "@/shared/lib/email/templates/verify-email";
import { buildAuthHref, type AuthRedirect } from "@/features/auth/utils/auth-flow";
import { routes } from "@/shared/constants/routes";

type AuthFlowInput = {
  redirect?: AuthRedirect | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

function buildAbsoluteUrl(pathname: string, searchParams?: Record<string, string>) {
  const url = new URL(pathname, getAppBaseUrl());

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export async function sendVerificationEmail(input: {
  email: string;
  token: string;
  flow?: AuthFlowInput;
}) {
  const verificationUrl = buildAbsoluteUrl(
    buildAuthHref(routes.auth.verifyEmail, input.flow ?? {}),
    { token: input.token },
  );

  await sendEmail(
    {
      to: [input.email],
      subject: "Confirmez votre adresse email",
      react: createElement(VerifyEmailTemplate, { verificationUrl }),
      text: `Confirmez votre adresse email : ${verificationUrl}`,
      tags: [{ name: "email_type", value: "verify_email" }],
    },
    {
      idempotencyKey: `verify-email/${input.token}`,
    },
  );
}

export async function sendPasswordResetEmail(input: {
  email: string;
  token: string;
}) {
  const resetUrl = buildAbsoluteUrl(routes.auth.resetPassword, {
    token: input.token,
  });

  await sendEmail(
    {
      to: [input.email],
      subject: "Réinitialisez votre mot de passe",
      react: createElement(ResetPasswordTemplate, { resetUrl }),
      text: `Réinitialisez votre mot de passe : ${resetUrl}`,
      tags: [{ name: "email_type", value: "reset_password" }],
    },
    {
      idempotencyKey: `reset-password/${input.token}`,
    },
  );
}

export async function sendPasswordChangedEmail(email: string) {
  await sendEmail(
    {
      to: [email],
      subject: "Votre mot de passe a été modifié",
      react: createElement(PasswordChangedTemplate),
      text: "Votre mot de passe a été modifié. Si ce n'était pas vous, réinitialisez-le immédiatement.",
      tags: [{ name: "email_type", value: "password_changed" }],
    },
    {
      idempotencyKey: `password-changed/${email}/${Date.now()}`,
    },
  );
}
