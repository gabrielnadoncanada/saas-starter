import { db } from "@/shared/lib/db/prisma";
import type { ResetPasswordInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { ResetPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { consumeAuthToken } from "@/features/auth/server/auth-tokens";
import { sendPasswordChangedEmail } from "@/features/auth/server/auth-emails";
import { hashPassword } from "@/features/auth/server/passwords";

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ResetPasswordActionState> {
  const authToken = await consumeAuthToken({
    token: input.token,
    type: "RESET_PASSWORD",
  });

  if (!authToken) {
    return {
      error: "This reset link is invalid or has expired.",
      values: {
        token: input.token,
        password: "",
        confirmPassword: "",
      },
    };
  }

  const passwordHash = await hashPassword(input.password);

  const user = await db.user.update({
    where: { id: authToken.userId },
    data: {
      passwordHash,
      passwordUpdatedAt: new Date(),
    },
    select: {
      email: true,
    },
  });

  await sendPasswordChangedEmail(user.email);

  return {
    success: "Your password has been updated. You can now sign in.",
    values: {
      token: input.token,
      password: "",
      confirmPassword: "",
    },
  };
}
