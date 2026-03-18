"use server";

import { signIn } from "@/auth";
import { validatedAction } from "@/shared/lib/actions/validated-action";
import { signInWithPasswordSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { signInWithPassword } from "@/features/auth/server/sign-in-with-password";
import { getPostSignInCallbackUrl } from "@/features/auth/utils/post-sign-in";

export const signInWithPasswordAction = validatedAction(
  signInWithPasswordSchema,
  async (data) => {
    const result = await signInWithPassword(data);

    if (result.error) {
      return result;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: getPostSignInCallbackUrl(data),
    });

    return {};
  },
);
