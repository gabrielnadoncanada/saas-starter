"use server";

import { headers } from "next/headers";

import {
  resendVerificationEmailSchema,
  type ResendVerificationEmailValues,
  signInFormSchema,
  type SignInFormValues,
  signUpFormSchema,
  type SignUpFormValues,
} from "@/features/auth/schemas/auth-forms.schema";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetValues,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas/password-change.schema";
import { routes } from "@/shared/constants/routes";
import { auth } from "@/shared/lib/auth/auth-config";
import { validatedPublicAction } from "@/shared/lib/auth/authenticated-action";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import type { FormActionState } from "@/shared/types/form-action-state";

type RedirectState<TValues extends Record<string, unknown>> =
  FormActionState<TValues> & {
    redirectTo?: string;
  };

export type SignInActionState = RedirectState<SignInFormValues> & {
  requiresVerification?: boolean;
};

export type SignUpActionState = RedirectState<SignUpFormValues>;
export type ResendVerificationActionState =
  FormActionState<ResendVerificationEmailValues>;
export type RequestPasswordResetActionState =
  FormActionState<RequestPasswordResetValues>;
export type ResetPasswordActionState = FormActionState<ResetPasswordValues>;

type BetterAuthErrorLike = {
  body?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
  status?: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAuthErrorCode(error: unknown) {
  const authError = error as BetterAuthErrorLike | null | undefined;

  if (typeof authError?.body?.code === "string") {
    return authError.body.code;
  }

  return typeof authError?.code === "string" ? authError.code : null;
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const authError = error as BetterAuthErrorLike | null | undefined;

  if (typeof authError?.body?.message === "string") {
    return authError.body.message;
  }

  if (typeof authError?.message === "string") {
    return authError.message;
  }

  return fallback;
}

export const signInAction = validatedPublicAction<
  typeof signInFormSchema,
  {
    redirectTo?: string;
    requiresVerification?: boolean;
  }
>(signInFormSchema, async ({ callbackUrl, email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  try {
    const result = await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email: normalizedEmail,
        password,
        callbackURL: callbackUrl,
      },
    });
    const requiresTwoFactor =
      typeof result === "object" &&
      result !== null &&
      "twoFactorRedirect" in result &&
      Boolean(result.twoFactorRedirect);

    return {
      redirectTo: requiresTwoFactor
        ? routes.auth.twoFactor
        : (callbackUrl ?? routes.auth.postSignIn),
    };
  } catch (error) {
    const code = getAuthErrorCode(error);

    if (code === "EMAIL_NOT_VERIFIED") {
      return {
        error: "Verify your email before signing in.",
        requiresVerification: true,
        values: { email: normalizedEmail, callbackUrl },
      };
    }

    if (code === "INVALID_EMAIL_OR_PASSWORD") {
      return {
        error: "Invalid email or password.",
        values: { email: normalizedEmail, callbackUrl },
      };
    }

    return {
      error: getAuthErrorMessage(error, "Unable to sign in. Please try again."),
      values: { email: normalizedEmail, callbackUrl },
    };
  }
});

export const signUpAction = validatedPublicAction<
  typeof signUpFormSchema,
  { redirectTo?: string }
>(
  signUpFormSchema,
  async ({ callbackUrl, confirmPassword: _, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const redirectTo = buildCallbackURL(
      routes.auth.verifyEmailSent,
      callbackUrl,
    );

    try {
      await auth.api.signUpEmail({
        headers: await headers(),
        body: {
          email: normalizedEmail,
          name: "",
          password,
          callbackURL: callbackUrl,
        },
      });

      return { redirectTo };
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return {
          error: "Please fix the highlighted fields.",
          values: { email: normalizedEmail, callbackUrl },
          fieldErrors: {
            email: ["This email is already in use."],
          },
        };
      }

      return {
        error: getAuthErrorMessage(error, "Unable to create account."),
        values: { email: normalizedEmail, callbackUrl },
      };
    }
  },
);

export const resendVerificationEmailAction = validatedPublicAction<
  typeof resendVerificationEmailSchema,
  {}
>(resendVerificationEmailSchema, async ({ callbackUrl, email }) => {
  const normalizedEmail = normalizeEmail(email);

  try {
    await auth.api.sendVerificationEmail({
      headers: await headers(),
      body: {
        email: normalizedEmail,
        callbackURL: callbackUrl,
      },
    });

    return { success: "A new verification email has been sent." };
  } catch (error) {
    return {
      error: getAuthErrorMessage(
        error,
        "Unable to send verification email. Please try again.",
      ),
      values: { email: normalizedEmail, callbackUrl },
    };
  }
});

export const requestPasswordResetAction = validatedPublicAction<
  typeof requestPasswordResetSchema,
  {}
>(requestPasswordResetSchema, async ({ callbackUrl, email }) => {
  const normalizedEmail = normalizeEmail(email);

  await auth.api.requestPasswordReset({
    headers: await headers(),
    body: {
      email: normalizedEmail,
      redirectTo: callbackUrl ?? routes.auth.resetPassword,
    },
  });

  return {
    success:
      "If an account exists for this email, a reset link has been sent. Check your inbox.",
  };
});

export const resetPasswordAction = validatedPublicAction<
  typeof resetPasswordSchema,
  {}
>(
  resetPasswordSchema,
  async ({ confirmPassword: _, newPassword }, formData) => {
    const token = String(formData.get("token") ?? "").trim();

    if (!token) {
      return {
        error: "This reset link is invalid or incomplete.",
      } satisfies FormActionState<ResetPasswordValues>;
    }

    try {
      await auth.api.resetPassword({
        headers: await headers(),
        body: {
          newPassword,
          token,
        },
      });

      return {
        success: "Your password has been updated. You can now sign in.",
      };
    } catch (error) {
      const code = getAuthErrorCode(error);

      if (code === "INVALID_TOKEN") {
        return {
          error: "This reset link is invalid or has expired.",
        };
      }

      return {
        error: getAuthErrorMessage(
          error,
          "Unable to reset password. Please try again.",
        ),
      };
    }
  },
);
