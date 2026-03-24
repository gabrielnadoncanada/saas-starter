"use server";

import { savePasswordServer } from "@/features/auth/server/save-password";
import { savePasswordSchema } from "@/features/auth/schemas/save-password.schema";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const savePasswordAction = validatedActionWithUser(
  savePasswordSchema,
  async ({ currentPassword, newPassword }, formData) => {
    const hasPassword = formData.get("hasPassword") === "true";

    return savePasswordServer({
      currentPassword,
      newPassword,
      hasPassword,
    });
  },
);
