import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/authorize';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const supabase = await createClient();

    const { data: recentlyViewed, error } = await supabase
      .from('recently_viewed')
      .select(`
        *,
        listing: listings (
          id,
          title,
          location,
          price,
          image_urls
        )
      `)
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('Failed to fetch recently viewed', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch recently viewed' }, { status: 500 });
    }

    return NextResponse.json({ properties: recentlyViewed || [] });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ForbiddenError' || error.name === 'UnauthorizedError')) {
      return NextResponse.json({ error: error.message }, { status: error.name === 'ForbiddenError' ? 403 : 401 });
    }
    logger.error('Failed to fetch recently viewed', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}