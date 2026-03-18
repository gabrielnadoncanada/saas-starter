"use server";

import { updatePasswordSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { updatePasswordForUser } from "@/features/auth/server/update-password";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const updatePasswordAction = validatedActionWithUser(
  updatePasswordSchema,
  async ({ currentPassword, newPassword }, _formData, user) => {
    return updatePasswordForUser({
      userId: user.id,
      currentPassword,
      newPassword,
    });
  },
);
