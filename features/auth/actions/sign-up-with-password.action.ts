"use server";

import { redirect } from "next/navigation";
import { signUpWithPasswordSchema } from "@/features/auth/schemas/credentials-auth.schema";
import { signUpWithPassword } from "@/features/auth/server/sign-up-with-password";
import { routes } from "@/shared/constants/routes";
import { validatedAction } from "@/shared/lib/actions/validated-action";
import { buildAuthHref } from "@/features/auth/utils/auth-flow";

export const signUpWithPasswordAction = validatedAction(
  signUpWithPasswordSchema,
  async (data) => {
    const result = await signUpWithPassword(data);

    if (result.error) {
      return result;
    }

    redirect(buildAuthHref(routes.auth.verifyEmailSent, data));
  },
);
