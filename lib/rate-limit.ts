import { logger } from '@/lib/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60000;
const MAX_REQUESTS = 10;

export function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function checkRateLimitMemory(ip: string, endpoint: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();

  for (const [k, e] of rateLimits) {
    if (now > e.resetTime) {
      rateLimits.delete(k);
    }
  }

  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

export async function checkRateLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // In-memory rate limiting only (Redis is optional, not required for basic functionality)
  return checkRateLimitMemory(ip, endpoint);
}

export const RATE_LIMITS = {
  INQUIRIES: 'inquiries',
  ADMIN_API: 'admin-api',
};