"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { updateAccountSchema } from "@/features/account/schemas/account.schema";
import {
  deleteUserAvatar,
  saveUserAvatar,
  shouldSaveAvatar,
} from "@/features/account/server/profile-image";
import { routes } from "@/shared/constants/routes";
import { auth } from "@/shared/lib/auth/auth-config";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const updateAccountAction = validatedAuthenticatedAction<
  typeof updateAccountSchema
>(updateAccountSchema, async ({ name }, formData, user) => {
  const removeAvatar = formData.get("removeAvatar") === "true";
  const avatarFile = formData.get("avatar");
  const avatar =
    avatarFile instanceof File && shouldSaveAvatar(avatarFile)
      ? avatarFile
      : null;

  try {
    if (avatar) {
      const image = await saveUserAvatar({
        userId: user.id,
        file: avatar,
      });

      await auth.api.updateUser({
        headers: await headers(),
        body: {
          name,
          image,
        },
      });
    } else if (removeAvatar) {
      await deleteUserAvatar(user.id);

      await auth.api.updateUser({
        headers: await headers(),
        body: {
          name,
          image: null,
        },
      });
    } else {
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          name,
        },
      });
    }

    revalidatePath(routes.settings.profile);

    return {
      success: "Account updated successfully.",
      values: {
        name,
      },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update account.",
      values: {
        name,
      },
    };
  }
});
