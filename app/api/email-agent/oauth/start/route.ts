import { NextResponse } from "next/server";

import { routes } from "@/constants/routes";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { buildGoogleAuthorizationUrl } from "@/lib/email-agent/google-oauth";
import { signOAuthState } from "@/lib/email-agent/oauth-state";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL(routes.auth.login, process.env.BASE_URL ?? "http://localhost:3000"),
    );
  }
  const membership = await requireActiveOrganizationMembership();

  const state = signOAuthState({
    organizationId: membership.organizationId,
    userId: user.id,
  });

  try {
    const url = buildGoogleAuthorizationUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start Google OAuth.",
      },
      { status: 500 },
    );
  }
}
