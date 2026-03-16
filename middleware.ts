import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { routes } from '@/shared/constants/routes';

const protectedPrefixes = [
  routes.app.dashboard,
];

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default auth((request) => {
  if (isProtectedRoute(request.nextUrl.pathname) && !request.auth) {
    return NextResponse.redirect(new URL(routes.auth.login, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
