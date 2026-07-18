import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const PlaceQuerySchema = z.object({
  lat: z.string().optional(),
  lng: z.string().optional(),
  location: z.string().optional(),
  radius: z.string().transform(Number).pipe(z.number().min(0.1).max(50)).optional().default('5'),
  categories: z.string().optional().default('school,hospital,restaurant,transport,shopping,cafe'),
});

const NearbyPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['school', 'hospital', 'shopping', 'restaurant', 'transport', 'cafe']),
  distance: z.number(),
  rating: z.number().optional(),
  address: z.string().optional(),
});

type NearbyPlace = z.infer<typeof NearbyPlaceSchema>;

const PLACE_CATEGORIES = {
  school: { key: 'amenity', value: 'school' },
  hospital: { key: 'amenity', value: 'hospital' },
  shopping: { key: 'shop', value: 'mall' },
  restaurant: { key: 'amenity', value: 'restaurant' },
  transport: { key: 'public_transport', value: 'station' },
  cafe: { key: 'amenity', value: 'cafe' },
} as const;

function generateMockPlaces(lat: number, lng: number, radius: number, categories: string): NearbyPlace[] {
  const catList = categories.split(',') as Array<keyof typeof PLACE_CATEGORIES>;
  const places: NearbyPlace[] = [];
  let id = 1;

  const mockData: Record<string, string[]> = {
    school: ['St. Mary\'s School', 'District Public School', 'Greenwood High School'],
    hospital: ['General Hospital', 'City Medical Center', 'Community Health Clinic'],
    restaurant: ['The Bistro', 'Cafe Delight', 'Restaurant 7'],
    transport: ['Central Station', 'Main Bus Terminal', 'Metro Station'],
    shopping: ['Downtown Market', 'Central Mall', 'Shopping Plaza'],
    cafe: ['Cafe Corner', 'Local Coffee House', 'Bean There'],
  };

  for (const cat of catList) {
    const names = mockData[cat] || [];
    for (let i = 0; i < Math.min(2, names.length); i++) {
      places.push({
        id: `mock-${id++}`,
        name: names[i],
        type: cat,
        distance: Number(((Math.random() * radius) + 0.5).toFixed(1)),
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
      });
    }
  }

  return places;
}

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(location);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      {
        headers: {
          'User-Agent': 'RealEstate-SaaS/1.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    logger.error('Geocoding failed', { error: (error as Error).message });
    return null;
  }
}

async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number,
  categories: string
): Promise<NearbyPlace[]> {
  const catList = categories.split(',') as Array<keyof typeof PLACE_CATEGORIES>;
  const places: NearbyPlace[] = [];
  let placeId = 1;

  const HEADERS: Record<string, string> = {
    'User-Agent': 'RealEstate-SaaS/1.0',
    'Accept': 'application/json',
  };

  const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

  for (const cat of catList) {
    const config = PLACE_CATEGORIES[cat];
    if (!config) continue;

    try {
      const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=[out:json][timeout:5];node[${config.key}=${config.value}](around:${radius * 1000},${lat},${lng});out center 10;`,
        headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.ok) continue;
      const data = await response.json();

      for (const node of data?.elements || []) {
        const distance = calculateDistance(
          lat, lng,
          node.lat || node.center?.lat,
          node.lon || node.center?.lon
        );
        places.push({
          id: `${cat}-${placeId++}`,
          name: node.tags?.name || `${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
          type: cat,
          distance: Number(distance.toFixed(1)),
          address: node.tags?.['addr:street'],
        });
      }
    } catch (error) {
      logger.error(`Failed to fetch ${cat} places`, { error: (error as Error).message });
    }
  }

  return places.sort((a, b) => a.distance - b.distance);
}

function calculateDistance(lat1: number, lon1: number, lat2: number | undefined, lon2: number | undefined): number {
  if (!lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: listingId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const query = PlaceQuerySchema.parse(Object.fromEntries(searchParams));

    let lat: number | undefined;
    let lng: number | undefined;

    if (query.lat && query.lng) {
      lat = parseFloat(query.lat);
      lng = parseFloat(query.lng);
    } else if (query.location) {
      const coords = await geocodeLocation(query.location);
      if (!coords) {
        return NextResponse.json(
          { error: 'Location not found', places: [] },
          { status: 404 }
        );
      }
      lat = coords.lat;
      lng = coords.lng;
    } else {
      return NextResponse.json(
        { error: 'Either lat/lng or location is required' },
        { status: 400 }
      );
    }

    const places = await fetchNearbyPlaces(lat, lng, query.radius, query.categories);

    if (places.length === 0) {
      const mockPlaces = generateMockPlaces(lat, lng, query.radius, query.categories);
      return NextResponse.json({
        places: mockPlaces,
        source: 'mock',
        coordinates: { lat, lng },
      });
    }

    return NextResponse.json({
      places,
      source: 'api',
      coordinates: { lat, lng },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Failed to fetch nearby places', { error: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal server error', places: [] },
      { status: 500 }
    );
  }
}