import { NextRequest, NextResponse } from 'next/server';

import { finalizeCheckoutSession } from '@/features/billing/server/finalize-checkout';
import { routes } from '@/shared/constants/routes';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL(routes.marketing.pricing, request.url));
  }

  try {
    await finalizeCheckoutSession(sessionId);
    return NextResponse.redirect(new URL(routes.app.dashboard, request.url));
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
