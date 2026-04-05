"use server";

import { unlinkAuthProviderSchema } from "@/features/account/schemas/account.schema";
import { unlinkOAuthAccountForUser } from "@/features/account/server/linked-accounts";
import { routes } from "@/shared/constants/routes";
import { redirectToLocale } from "@/shared/i18n/href";
import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";

export const unlinkAuthProviderAction = validatedAuthenticatedAction<
  typeof unlinkAuthProviderSchema,
  {}
>(unlinkAuthProviderSchema, async ({ provider }, _formData, user) => {
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

  return redirectToLocale(
    null,
    `${routes.settings.profile}?provider=${provider}&success=unlinked`,
  );
});

