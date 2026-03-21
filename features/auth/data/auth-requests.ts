"use client";

import { authClient } from "@/shared/lib/auth/auth-client";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";
import { routes } from "@/shared/constants/routes";
import { normalizeEmail } from "@/features/auth/utils/normalize-email";

export type SignInWithPasswordResult =
  | { status: "success" }
  | { status: "verification_required"; message: string }
  | { status: "invalid_credentials"; message: string }
  | { status: "error"; message: string };

export type SignUpWithEmailResult =
  | { status: "success" }
  | { status: "email_taken"; message: string }
  | { status: "error"; message: string };

export type ResetPasswordResult =
  | { status: "success" }
  | { status: "invalid_token"; message: string }
  | { status: "error"; message: string };

export type SavePasswordResult =
  | { status: "success" }
  | { status: "incorrect_current_password"; message: string }
  | { status: "error"; message: string };

type AuthClientError = {
  code?: string;
  message?: string;
  status?: number;
};

function getAuthErrorCode(error: AuthClientError | null | undefined) {
  return typeof error?.code === "string" ? error.code : null;
}

function getAuthErrorMessage(
  error: AuthClientError | null | undefined,
  fallback: string,
) {
  return error?.message ?? fallback;
}

export function buildCheckEmailHref(email: string, callbackUrl: string) {
  const query = new URLSearchParams({
    email: normalizeEmail(email),
  });
  const baseHref = buildCallbackURL(routes.auth.checkEmail, callbackUrl);
  const separator = baseHref.includes("?") ? "&" : "?";

  return `${baseHref}${separator}${query.toString()}`;
}

export async function sendMagicLink(email: string, callbackUrl: string) {
  const { error } = await authClient.signIn.magicLink({
    email: normalizeEmail(email),
    callbackURL: callbackUrl,
  });

  if (error) {
    throw new Error(error.message || "Unable to send magic link.");
  }
}

export async function signInWithOAuth(provider: OAuthProviderId, callbackUrl: string) {
  const { error } = await authClient.signIn.social({
    provider,
    callbackURL: callbackUrl,
  });

  if (error) {
    throw new Error(error.message || "Unable to continue. Please try again.");
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInWithPasswordResult> {
  const { error } = await authClient.signIn.email({
    email: normalizeEmail(email),
    password,
  });

  if (!error) {
    return { status: "success" };
  }

  const code = getAuthErrorCode(error);
  const message = getAuthErrorMessage(error, "Unable to sign in. Please try again.");

  if (code === "EMAIL_NOT_VERIFIED") {
    return {
      status: "verification_required",
      message: "Verify your email before signing in.",
    };
  }

  if (code === "INVALID_EMAIL_OR_PASSWORD" || error.status === 401) {
    return {
      status: "invalid_credentials",
      message: "Invalid email or password.",
    };
  }

  return { status: "error", message };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  callbackUrl: string,
): Promise<SignUpWithEmailResult> {
  const { error } = await authClient.signUp.email({
    email: normalizeEmail(email),
    password,
    name: "",
    callbackURL: callbackUrl,
  });

  if (!error) {
    return { status: "success" };
  }

  if (getAuthErrorCode(error) === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
    return {
      status: "email_taken",
      message: "This email is already in use.",
    };
  }

  const message = getAuthErrorMessage(error, "Unable to create account.");
  return { status: "error", message };
}

export async function resendVerificationEmail(email: string) {
  const { error } = await authClient.sendVerificationEmail({
    email: normalizeEmail(email),
    callbackURL: routes.auth.login,
  });

  if (error) {
    throw new Error(error.message || "Unable to resend verification email.");
  }
}

export async function requestPasswordReset(email: string) {
  await authClient.requestPasswordReset({
    email: normalizeEmail(email),
    redirectTo: routes.auth.resetPassword,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const { error } = await authClient.resetPassword({
    newPassword,
    token,
  });

  if (!error) {
    return { status: "success" };
  }

  if (getAuthErrorCode(error) === "INVALID_TOKEN") {
    return {
      status: "invalid_token",
      message: "This reset link is invalid or has expired.",
    };
  }

  const message = getAuthErrorMessage(
    error,
    "Unable to reset password. Please try again.",
  );
  return { status: "error", message };
}

export async function savePassword(
  hasPassword: boolean,
  newPassword: string,
  currentPassword?: string,
): Promise<SavePasswordResult> {
  const result = hasPassword
    ? await authClient.changePassword({
        currentPassword: currentPassword ?? "",
        newPassword,
      })
    : await authClient.$fetch<{ status: boolean }>("/set-password", {
        method: "POST",
        body: { newPassword },
      });

  if (!result.error) {
    return { status: "success" };
  }

  if (getAuthErrorCode(result.error) === "INVALID_PASSWORD") {
    return {
      status: "incorrect_current_password",
      message: "Current password is incorrect.",
    };
  }

  const message = getAuthErrorMessage(result.error, "Unable to update password.");
  return { status: "error", message };
}
