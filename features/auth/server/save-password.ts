import { headers } from "next/headers";

import type { PasswordFormValues } from "@/features/auth/password-change.schema";
import { auth } from "@/lib/auth/auth-config";
import { getAuthErrorCode, getAuthErrorMessage } from "@/lib/auth/auth-errors";
import type { FormActionState } from "@/types/form-action-state";

type SavePasswordParams = Pick<
  PasswordFormValues,
  "currentPassword" | "newPassword"
> & {
  hasPassword: boolean;
};

export async function savePasswordServer({
  currentPassword,
  newPassword,
  hasPassword,
}: SavePasswordParams): Promise<FormActionState<PasswordFormValues>> {
  try {
    if (hasPassword) {
      await auth.api.changePassword({
        headers: await headers(),
        body: {
          currentPassword,
          newPassword,
        },
      });
    } else {
      await auth.api.setPassword({
        headers: await headers(),
        body: {
          newPassword,
        },
      });
    }

    return {
      success: hasPassword
        ? "Password updated successfully."
        : "Password created successfully.",
    };
  } catch (error) {
    const code = getAuthErrorCode(error);

    if (code === "INVALID_PASSWORD" || code === "INCORRECT_PASSWORD") {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: {
          currentPassword: ["Current password is incorrect."],
        },
      };
    }

    return { error: getAuthErrorMessage(error, "Unable to update password.") };
  }
}
