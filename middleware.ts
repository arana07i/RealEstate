import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { applySecurityHeaders } from '@/lib/security-middleware';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
