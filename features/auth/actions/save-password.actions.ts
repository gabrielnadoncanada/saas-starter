"use server";

import { savePasswordSchema } from "@/features/auth/password-change.schema";
import { savePasswordServer } from "@/features/auth/server/save-password";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const savePasswordAction = validatedAuthenticatedAction(
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
