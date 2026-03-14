"use server";

import { redirect } from "next/navigation";

import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";
import { getCurrentTeam } from "@/features/teams/server/current-team";
import { createCheckoutSession } from "@/features/billing/server/create-checkout-session";

export async function checkoutAction(formData: FormData) {
  const user = await getCurrentUser();
  const priceId = formData.get("priceId") as string;

  if (!user) {
    redirect(`${routes.auth.login}?redirect=checkout&priceId=${priceId}`);
  }

  const team = await getCurrentTeam();
  if (!team) throw new Error("Team not found");

  const url = await createCheckoutSession({
    priceId,
    stripeCustomerId: team.stripeCustomerId,
    userEmail: user.email,
    userId: user.id,
  });

  redirect(url);
}
