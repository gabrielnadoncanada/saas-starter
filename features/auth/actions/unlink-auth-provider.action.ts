"use server";

import { refresh } from "next/cache";

import { validatedActionWithUser } from "@/lib/auth/validated-action-with-user";
import { OAUTH_PROVIDER_LABELS } from "@/lib/auth/providers";
import { unlinkOAuthAccountForUser } from "@/features/auth/server/linked-accounts";
import { unlinkAuthProviderSchema } from "@/features/auth/schemas/account.schema";

export const unlinkAuthProviderAction = validatedActionWithUser(
  unlinkAuthProviderSchema,
  async ({ provider }, _, user) => {
    const result = await unlinkOAuthAccountForUser({
      userId: user.id,
      provider,
    });

    if (result.status === "not-found") {
      return {
        provider,
        error: `${OAUTH_PROVIDER_LABELS[provider]} is not linked to this account.`,
      };
    }

    if (result.status === "blocked") {
      return {
        provider,
        error: `Link another sign-in provider before unlinking ${OAUTH_PROVIDER_LABELS[provider]}.`,
      };
    }

    refresh();

    return {
      provider,
      success: `${OAUTH_PROVIDER_LABELS[provider]} unlinked successfully.`,
    };
  },
);
