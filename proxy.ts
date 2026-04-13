import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

import { routes } from "@/constants/routes";

const protectedPrefixes = ["/dashboard", "/settings", "/admin"];

export function proxy(request: Request & { nextUrl: URL }) {
  const pathname = request.nextUrl.pathname;
  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const redirectUrl = new URL(routes.auth.login, request.url);
      redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
