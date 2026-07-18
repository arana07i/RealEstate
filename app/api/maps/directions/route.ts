import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getDirections, type Coordinates } from '@/lib/maps';
import { logger } from '@/lib/logger';

const DirectionsQuerySchema = z.object({
  origin: z.string(),
  destination: z.string(),
  mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).optional().default('driving'),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = DirectionsQuerySchema.parse(Object.fromEntries(searchParams));

    const parseCoords = (str: string): Coordinates => {
      const [lat, lng] = str.split(',').map(Number);
      return { lat: lat || 0, lng: lng || 0 };
    };

    const origin = parseCoords(query.origin);
    const destination = parseCoords(query.destination);

    const directions = await getDirections(origin, destination, query.mode);

    if (!directions) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 });
    }

    return NextResponse.json({ directions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    logger.error('Failed to fetch directions', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}