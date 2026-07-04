import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-analytics.com https://vercel-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': CSP_POLICY,
};

interface SecurityOptions {
  allowIframe?: boolean;
  customPolicy?: string;
}

export function applySecurityHeaders(response: NextResponse, options: SecurityOptions = {}): NextResponse {
  const headers = options.customPolicy 
    ? { ...SECURITY_HEADERS, 'Content-Security-Policy': options.customPolicy }
    : SECURITY_HEADERS;

  if (options.allowIframe) {
    headers['X-Frame-Options'] = 'SAMEORIGIN';
    headers['Content-Security-Policy'] = headers['Content-Security-Policy'].replace(
      "frame-ancestors 'none'", 
      "frame-ancestors 'self'"
    );
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function securityMiddleware(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  
  return applySecurityHeaders(response);
}

export function logSecurityEvent(event: string, details: Record<string, unknown>): void {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
  });
}