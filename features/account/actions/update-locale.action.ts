"use server";

import { z } from "zod";

import { validatedAuthenticatedAction } from "@/shared/lib/auth/authenticated-action";
import { db } from "@/shared/lib/db/prisma";

const updateLocaleSchema = z.object({
  preferredLocale: z.enum(["en", "fr"]),
});

export const updateLocaleAction = validatedAuthenticatedAction<
  typeof updateLocaleSchema,
  {}
>(updateLocaleSchema, async ({ preferredLocale }, _, user) => {
  await db.user.update({
    where: { id: user.id },
    data: { preferredLocale },
  });

  return { success: "Language preference updated" };
});
