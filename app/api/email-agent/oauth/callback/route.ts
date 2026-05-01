import { NextResponse } from "next/server";

import { upsertEmailAccount } from "@/features/email-agent/server/email-accounts";
import { runInTenantScope } from "@/lib/db/tenant-scope";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
} from "@/lib/email-agent/google-oauth";
import { verifyOAuthState } from "@/lib/email-agent/oauth-state";

export const dynamic = "force-dynamic";

function buildRedirect(path: string, search?: Record<string, string>) {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  const url = new URL(path, base);
  if (search) {
    for (const [k, v] of Object.entries(search)) {
      url.searchParams.set(k, v);
    }
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return buildRedirect("/email-agent/accounts", { error: errorParam });
  }
  if (!code || !stateParam) {
    return buildRedirect("/email-agent/accounts", {
      error: "missing_params",
    });
  }

  let state: ReturnType<typeof verifyOAuthState>;
  try {
    state = verifyOAuthState(stateParam);
  } catch {
    return buildRedirect("/email-agent/accounts", { error: "bad_state" });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    if (!userInfo.email) {
      throw new Error("Google did not return an email address.");
    }

    await runInTenantScope(state.organizationId, async () => {
      await upsertEmailAccount({
        organizationId: state.organizationId,
        connectedByUserId: state.userId,
        email: userInfo.email,
        tokens,
      });
    });

    return buildRedirect("/email-agent/accounts", { connected: userInfo.email });
  } catch (error) {
    return buildRedirect("/email-agent/accounts", {
      error:
        error instanceof Error ? error.message.slice(0, 200) : "oauth_failed",
    });
  }
}
