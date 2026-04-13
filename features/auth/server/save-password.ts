import { headers } from "next/headers";

import type { PasswordFormValues } from "@/features/auth/password-change.schema";
import { auth } from "@/lib/auth/auth-config";
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
    const message =
      error instanceof Error ? error.message : "Unable to update password.";

    if (
      message.toLowerCase().includes("incorrect") ||
      message.toLowerCase().includes("invalid")
    ) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: {
          currentPassword: ["Current password is incorrect."],
        },
      };
    }

    return { error: message };
  }
}
