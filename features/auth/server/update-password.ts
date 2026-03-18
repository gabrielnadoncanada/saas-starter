import { db } from "@/shared/lib/db/prisma";
import type { UpdatePasswordInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { UpdatePasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { sendPasswordChangedEmail } from "@/features/auth/server/auth-emails";
import { hashPassword, verifyPassword } from "@/features/auth/server/passwords";

export async function updatePasswordForUser(input: {
  userId: number;
  currentPassword?: string;
  newPassword: string;
}): Promise<UpdatePasswordActionState> {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: {
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      error: "User not found.",
    };
  }

  if (user.passwordHash) {
    if (!input.currentPassword) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: {
          currentPassword: ["Current password is required."],
        },
        values: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        } satisfies Partial<UpdatePasswordInput>,
      };
    }

    const isValidCurrentPassword = await verifyPassword(
      input.currentPassword,
      user.passwordHash,
    );

    if (!isValidCurrentPassword) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: {
          currentPassword: ["Current password is incorrect."],
        },
        values: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        } satisfies Partial<UpdatePasswordInput>,
      };
    }
  }

  const passwordHash = await hashPassword(input.newPassword);

  await db.user.update({
    where: { id: input.userId },
    data: {
      passwordHash,
      passwordUpdatedAt: new Date(),
    },
  });

  await sendPasswordChangedEmail(user.email);

  return {
    success: user.passwordHash
      ? "Password updated successfully."
      : "Password created successfully.",
    values: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies Partial<UpdatePasswordInput>,
  };
}
