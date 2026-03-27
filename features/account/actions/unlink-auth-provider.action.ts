"use server";

import { redirect } from "next/navigation";

import { unlinkOAuthAccountForUser } from "@/features/account/server/linked-accounts";
import { unlinkAuthProviderSchema } from "@/features/account/schemas/account.schema";
import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";

export const unlinkAuthProviderAction = validatedActionWithUser<
  typeof unlinkAuthProviderSchema,
  {}
>(
  unlinkAuthProviderSchema,
  async ({ provider }) => {
    const result = await unlinkOAuthAccountForUser({
      provider,
    });

    if (result.status === "blocked") {
      return {
        error:
          "You must keep at least one sign-in method linked to your account.",
        values: { provider },
      };
    }

    if (result.status === "not-found") {
      return {
        error: "This provider is not linked to your account.",
        values: { provider },
      };
    }

    return redirect(
      `${routes.settings.profile}?provider=${provider}&success=unlinked`,
    );
  },
);
