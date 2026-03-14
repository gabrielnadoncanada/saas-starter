"use server";

import { redirect } from "next/navigation";

import { routes } from "@/shared/constants/routes";
import { validatedActionWithUser } from "@/shared/lib/auth/validated-action-with-user";
import { unlinkOAuthAccountForUser } from "@/features/account/server/linked-accounts";
import { unlinkAuthProviderSchema } from "@/features/account/schemas/account.schema";

export const unlinkAuthProviderAction = validatedActionWithUser(
  unlinkAuthProviderSchema,
  async ({ provider }, _, user) => {
    const result = await unlinkOAuthAccountForUser({
      userId: user.id,
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

    redirect(
      `${routes.app.settingsSecurity}?provider=${provider}&success=unlinked`,
    );
  },
);
