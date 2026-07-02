import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, hostname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isLoginPage = pathname === '/admin/login';
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  // Extract agency slug from subdomain (e.g., agency.example.com) or path (e.g., /agency-slug)
  let agencySlug: string | null = null;
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    agencySlug = hostParts[0];
  }

  // Also check custom domain header for whitelabel support
  const customDomain = request.headers.get('x-agency-domain');

  // Get agency and set context for RLS
  let agencyId: string | null = null;
  if (agencySlug || customDomain) {
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('slug', agencySlug ?? customDomain)
      .single();
    agencyId = agency?.id ?? null;
  }

  // Set agency context for authenticated requests
  if (user && agencyId) {
    supabaseResponse.cookies.set('x-agency-id', agencyId, { httpOnly: true, secure: true });
  }

  // Redirect logic
  if ((isAdminRoute || isAdminApiRoute) && !isLoginPage && !isOnboardingRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Make agency data available to downstream handlers
  const requestHeaders = new Headers(request.headers);
  if (agencyId) {
    requestHeaders.set('x-agency-id', agencyId);
  }

  supabaseResponse.headers.set('x-agency-id', agencyId ?? '');

  return supabaseResponse;
}