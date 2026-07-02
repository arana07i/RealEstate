import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { validateEnvironment, getEnv } from '@/lib/env';

if (typeof window === 'undefined') {
  validateEnvironment();
}

/** Cookie-less client for SSR/SSG public data fetching at build time */
export function createStaticClient() {
  try {
    const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createSupabaseClient(url, key);
  } catch {
    return null;
  }
}
