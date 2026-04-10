"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  type UpdateAccountInput,
  updateAccountSchema,
} from "@/features/account/schemas/account.schema";
import {
  deleteUserAvatar,
  saveUserAvatar,
  shouldSaveAvatar,
} from "@/features/account/server/profile-image";
import { auth } from "@/shared/lib/auth/auth-config";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import type { FormActionState } from "@/shared/types/form-action-state";

export async function updateAccountAction(
  _prevState: FormActionState<UpdateAccountInput>,
  formData: FormData,
): Promise<FormActionState<UpdateAccountInput>> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You are not signed in." };
  }

  const parsed = updateAccountSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();

    return {
      error: "Please fix the highlighted fields.",
      values: {
        name: String(formData.get("name") ?? ""),
      },
      fieldErrors: flat.fieldErrors,
    };
  }

  const { name } = parsed.data;
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
}
