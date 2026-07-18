import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { geocodeAddress } from '@/lib/maps';
import { logger } from '@/lib/logger';

const GeocodeQuerySchema = z.object({
  address: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = GeocodeQuerySchema.parse(Object.fromEntries(searchParams));

    const result = await geocodeAddress(query.address);

    if (!result) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ coordinates: result.coordinates, formatted_address: result.formatted_address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    logger.error('Failed to geocode address', { error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}