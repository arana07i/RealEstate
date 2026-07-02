import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/** Cookie-less client for SSR/SSG public data fetching at build time */
export function createStaticClient() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return createSupabaseClient(url, key);
  } catch {
    return null;
  }
}
