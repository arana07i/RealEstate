import { getEnv } from './env';

const GOOGLE_MAPS_API_KEY = getEnv('GOOGLE_PLACES_API_KEY');
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  coordinates: Coordinates;
  formatted_address: string;
}

export interface Place {
  id: string;
  name: string;
  type: string;
  distance: number;
  rating?: number;
  address?: string;
  coordinates: Coordinates;
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviews?: Array<{ text: string; rating: number }>;
  openingHours?: string[];
  phoneNumber?: string;
  website?: string;
  photos?: string[];
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  steps: Array<{ instruction: string; distance: string }>;
  polyline: string;
}

function createCache<T>() {
  const cache = new Map<string, { data: T; timestamp: number }>();
  const TTL = 5 * 60 * 1000;

  return {
    get: (key: string): T | undefined => {
      const item = cache.get(key);
      if (item && Date.now() - item.timestamp < TTL) {
        return item.data;
      }
      cache.delete(key);
      return undefined;
    },
    set: (key: string, data: T) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
  };
}

const geocodeCache = createCache<GeocodeResult[]>();
const placesCache = createCache<Place[]>();
const directionsCache = createCache<DirectionsResult>();

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const cacheKey = `geocode-${address}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.length > 0) {
    return cached[0];
  }

  if (GOOGLE_MAPS_API_KEY) {
    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result: GeocodeResult = {
        address,
        coordinates: {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        },
        formatted_address: data.results[0].formatted_address,
      };
      geocodeCache.set(cacheKey, [result]);
      return result;
    }
  }

  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RealEstate-SAAS/1.0' },
  });
  const data = await response.json();

  if (data && data.length > 0) {
    const result: GeocodeResult = {
      address,
      coordinates: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
      formatted_address: data[0].display_name,
    };
    geocodeCache.set(cacheKey, [result]);
    return result;
  }

  return null;
}

export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult | null> {
  const cacheKey = `reverse-${coordinates.lat}-${coordinates.lng}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.length > 0) {
    return cached[0];
  }

  if (GOOGLE_MAPS_API_KEY) {
    const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result: GeocodeResult = {
        address: data.results[0].formatted_address,
        coordinates,
        formatted_address: data.results[0].formatted_address,
      };
      geocodeCache.set(cacheKey, [result]);
      return result;
    }
  }

  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RealEstate-SAAS/1.0' },
  });
  const data = await response.json();

  if (data && data.display_name) {
    const result: GeocodeResult = {
      address: data.display_name,
      coordinates,
      formatted_address: data.display_name,
    };
    geocodeCache.set(cacheKey, [result]);
    return result;
  }

  return null;
}

export async function searchNearbyPlaces(
  coordinates: Coordinates,
  type: string,
  radius: number = 5000
): Promise<Place[]> {
  const cacheKey = `nearby-${coordinates.lat}-${coordinates.lng}-${type}-${radius}`;
  const cached = placesCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const typeMapping: Record<string, string> = {
    school: 'school',
    hospital: 'hospital',
    restaurant: 'restaurant',
    shopping: 'shopping_mall',
    cafe: 'cafe',
    transport: 'transit_station',
  };

  const places: Place[] = [];

  if (GOOGLE_MAPS_API_KEY) {
    const googleType = typeMapping[type];
    const url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&type=${googleType}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      for (const result of data.results) {
        places.push({
          id: result.place_id,
          name: result.name,
          type,
          distance: calculateDistance(coordinates, { lat: result.geometry.location.lat, lng: result.geometry.location.lng }),
          rating: result.rating,
          address: result.vicinity,
          coordinates: { lat: result.geometry.location.lat, lng: result.geometry.location.lng },
        });
      }
      placesCache.set(cacheKey, places);
      return places;
    }
  }

  const nominatimQueries: Record<string, string> = {
    school: 'school',
    hospital: 'hospital',
    restaurant: 'restaurant',
    shopping: 'mall',
    cafe: 'cafe',
    transport: 'station',
  };

  const query = nominatimQueries[type];
  if (query) {
    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${query}&bounded=1&viewbox=${coordinates.lng - 0.1},${coordinates.lat + 0.1},${coordinates.lng + 0.1},${coordinates.lat - 0.1}&limit=20`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RealEstate-SAAS/1.0' },
    });
    const data = await response.json();

    if (data && data.length) {
      for (const result of data) {
        places.push({
          id: result.osm_id.toString(),
          name: result.name || result.display_name.split(',')[0],
          type,
          distance: calculateDistance(coordinates, { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }),
          address: result.display_name,
          coordinates: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
        });
      }
    }
  }

  placesCache.set(cacheKey, places);
  return places;
}

export async function getPlaceDetails(placeId: string, provider = 'google'): Promise<PlaceDetails | null> {
  if (provider === 'google' && GOOGLE_MAPS_API_KEY) {
    const url = `${GOOGLE_MAPS_BASE_URL}/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=name,formatted_address,rating,reviews,opening_hours,formatted_phone_number,website,photos`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        id: placeId,
        name: data.result.name,
        address: data.result.formatted_address,
        rating: data.result.rating,
        reviews: data.result.reviews?.map((r: { text: string; rating: number }) => ({ text: r.text, rating: r.rating })),
        openingHours: data.result.opening_hours?.weekday_text,
        phoneNumber: data.result.formatted_phone_number,
        website: data.result.website,
        photos: data.result.photos?.map((p: { photo_reference: string }) =>
          `${GOOGLE_MAPS_BASE_URL}/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        ),
      };
    }
  }

  return null;
}

export async function getDirections(
  origin: Coordinates | string,
  destination: Coordinates | string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<DirectionsResult | null> {
  const cacheKey = `directions-${typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`}-${typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`}-${mode}`;
  const cached = directionsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (GOOGLE_MAPS_API_KEY) {
    const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
    const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
    const url = `${GOOGLE_MAPS_BASE_URL}/directions/json?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const result: DirectionsResult = {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        steps: route.legs[0].steps.map((s: { html_instructions: string; distance: { text: string } }) => ({
          instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
          distance: s.distance.text,
        })),
        polyline: route.overview_polyline?.points || '',
      };
      directionsCache.set(cacheKey, result);
      return result;
    }
  }

  const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
  const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;
  const url = `https://router.project-osrm.org/route/v1/${mode}/${originStr.split(',').reverse().join('/')}/${destStr.split(',').reverse().join('/')}?overview=full&geometries=polyline`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.code === 'Ok' && data.routes.length > 0) {
    const route = data.routes[0];
    const result: DirectionsResult = {
      distance: `${(route.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(route.duration / 60)} mins`,
      steps: route.legs?.[0]?.steps?.map((s: { name: string; distance: number }) => ({
        instruction: s.name || 'Continue',
        distance: `${(s.distance / 1000).toFixed(2)} km`,
      })) || [],
      polyline: route.geometry,
    };
    directionsCache.set(cacheKey, result);
    return result;
  }

  return null;
}

export function getStreetViewUrl(coordinates: Coordinates, options?: { heading?: number; pitch?: number; fov?: number }): string {
  const { heading = 0, pitch = 0, fov = 90 } = options || {};
  const apiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    const params = new URLSearchParams({
      size: '800x600',
      location: `${coordinates.lat},${coordinates.lng}`,
      heading: String(heading),
      pitch: String(pitch),
      fov: String(fov),
      key: apiKey,
    });
    return `${GOOGLE_MAPS_BASE_URL}/streetview?${params.toString()}`;
  }

  return `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=19/${coordinates.lat}/${coordinates.lng}`;
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) / 1000);
}

export const DEFAULT_COORDINATES: Coordinates = { lat: 31.0615, lng: 77.1708 };

export function getDefaultMapCenter(location?: string): Coordinates {
  const shimlaLocations: Record<string, Coordinates> = {
    'mall road': { lat: 31.0648, lng: 77.1712 },
    'chotta shimla': { lat: 31.0578, lng: 77.1689 },
    'mashobra': { lat: 31.1522, lng: 77.2654 },
    'kufri': { lat: 31.1434, lng: 77.2006 },
    'summer hill': { lat: 31.0542, lng: 77.1787 },
    'sanjauli': { lat: 31.0721, lng: 77.1658 },
    'tara devi': { lat: 31.0889, lng: 77.1934 },
    'dhalli': { lat: 31.0694, lng: 77.2456 },
    'boileauganj': { lat: 31.0567, lng: 77.1612 },
  };

  if (location) {
    const lowerLocation = location.toLowerCase();
    for (const [key, coords] of Object.entries(shimlaLocations)) {
      if (lowerLocation.includes(key)) {
        return coords;
      }
    }
  }

  return DEFAULT_COORDINATES;
}

export function isGoogleMapsAvailable(): boolean {
  if (typeof window !== 'undefined') {
    return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }
  return Boolean(GOOGLE_MAPS_API_KEY);
}