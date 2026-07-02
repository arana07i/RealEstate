import { logger } from '@/lib/logger';

const REDIS_URL = process.env.REDIS_URL;

let redisClient: unknown = null;

async function getRedis(): Promise<unknown | null> {
  if (!REDIS_URL || redisClient) return redisClient;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('redis');
    const client = createClient({ url: REDIS_URL });
    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (err) {
    logger.warn('Redis connection failed, falling back to in-memory', { error: (err as Error).message });
    return null;
  }
}

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

async function checkRateLimitRedis(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const client = await getRedis();
  if (!client) return checkRateLimitMemory(ip, endpoint);

  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();

  const entryStr = await (client as { get: (k: string) => Promise<string | null> }).get(key);
  const entry: RateLimitEntry | null = entryStr ? JSON.parse(entryStr) : null;

  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = { count: 1, resetTime: now + WINDOW_MS };
    await (client as { set: (k: string, v: string) => Promise<void> }).set(key, JSON.stringify(newEntry));
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  await (client as { set: (k: string, v: string) => Promise<void> }).set(key, JSON.stringify(entry));
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
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
  return checkRateLimitRedis(ip, endpoint);
}

export const RATE_LIMITS = {
  INQUIRIES: 'inquiries',
  ADMIN_API: 'admin-api',
};