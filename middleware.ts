import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { routes } from '@/shared/constants/routes';

const protectedRoutes = routes.app.dashboard;

export default auth((request) => {
  const isProtectedRoute = request.nextUrl.pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !request.auth) {
    return NextResponse.redirect(new URL(routes.auth.login, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
