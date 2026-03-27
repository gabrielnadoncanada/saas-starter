"use server";

import { savePasswordServer } from "@/features/auth/server/save-password";
import { savePasswordSchema } from "@/features/auth/schemas/save-password.schema";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/validated-authenticated-action";

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
