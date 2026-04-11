"use server";

import { redirect } from "next/navigation";

import { unlinkAuthProviderSchema } from "@/features/account/schemas/account.schema";
import { unlinkOAuthAccountForUser } from "@/features/account/server/linked-accounts";
import { routes } from "@/shared/constants/routes";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const unlinkAuthProviderAction = validatedAuthenticatedAction(
  unlinkAuthProviderSchema,
  async ({ provider }) => {
  const result = await unlinkOAuthAccountForUser({ provider });

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
