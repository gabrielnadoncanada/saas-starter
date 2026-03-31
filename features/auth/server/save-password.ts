import { headers } from "next/headers";

import { auth } from "@/shared/lib/auth/auth-config";
import type { FormActionState } from "@/shared/types/form-action-state";
import type { SavePasswordInput } from "@/features/auth/schemas/save-password.schema";

type SavePasswordParams = {
  currentPassword: string;
  newPassword: string;
  hasPassword: boolean;
};

export async function savePasswordServer({
  currentPassword,
  newPassword,
  hasPassword,
}: SavePasswordParams): Promise<FormActionState<SavePasswordInput>> {
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

    if (message.toLowerCase().includes("incorrect") || message.toLowerCase().includes("invalid")) {
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
