import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseUserRoleData } from '@/lib/types';

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
  const isUserManagementRoute = pathname.startsWith('/admin/users');

  // Extract agency slug from subdomain or custom domain header
  let agencySlug: string | null = null;
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    agencySlug = hostParts[0];
  }

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

  let userRole: string | null = null;
  let userAgencyId: string | null = null;
  let isSuperAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    userAgencyId = profile?.agency_id ?? null;

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        agency_id,
        roles (name)
      `)
      .eq('user_id', user.id);

    if (userRoleData && userRoleData.length > 0) {
      const roles = userRoleData as SupabaseUserRoleData[];
      const primaryRole = roles.find((ur) => ur.agency_id === (agencyId || userAgencyId)) || roles[0];
      const rolesObj = primaryRole?.roles;
      userRole = Array.isArray(rolesObj) ? rolesObj[0]?.name : typeof rolesObj === 'object' && rolesObj?.name ? rolesObj.name : null;
      isSuperAdmin = userRole === 'super_admin';
    }

    // RBAC: Verify user has access to this agency
    if (agencyId && !isSuperAdmin) {
      if (userAgencyId !== agencyId) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(url);
      }
    }

    // RBAC: Protect user management routes
    if (isUserManagementRoute && !isSuperAdmin && userRole !== 'agency_admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  }

  // Set agency context for authenticated requests
  if (user && agencyId) {
    supabaseResponse.cookies.set('x-agency-id', agencyId, { httpOnly: true, secure: true });
  }

  // Set role context
  if (userRole) {
    supabaseResponse.headers.set('x-user-role', userRole);
  }
  if (userAgencyId) {
    supabaseResponse.headers.set('x-user-agency-id', userAgencyId);
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
  if (userRole) {
    requestHeaders.set('x-user-role', userRole);
  }

  supabaseResponse.headers.set('x-agency-id', agencyId ?? '');
  supabaseResponse.headers.set('x-user-role', userRole ?? '');
  supabaseResponse.headers.set('x-user-agency-id', userAgencyId ?? '');

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
