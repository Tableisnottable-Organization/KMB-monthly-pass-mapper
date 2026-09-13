import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter } from '../../../lib/cloudflare';

export const dynamic = 'force-dynamic';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export async function GET(request: NextRequest) {
  const rateLimiter = await getRateLimiter();
  const ipAddress = request.headers.get('cf-connecting-ip') ?? 'unknown';
  if (rateLimiter) {
    const result = await rateLimiter.limit({ key: `places:${ipAddress}` });
    if (!result.success) {
      return NextResponse.json({ error: 'Too many place searches.' }, { status: 429 });
    }
  }
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ data: [] });
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${query}, Hong Kong`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TransitCompassHK/1.0 (place search)',
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Place search provider unavailable.' }, { status: 502 });
    }

    const results = (await response.json()) as NominatimResult[];
    return NextResponse.json({
      data: results.map((result) => ({
        id: String(result.place_id),
        name: result.display_name.split(',')[0],
        address: result.display_name,
        lat: Number(result.lat),
        lng: Number(result.lon),
        type: result.type,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${result.lat},${result.lon}`,
        )}`,
      })),
      meta: { provider: 'OpenStreetMap Nominatim', region: 'HK' },
    }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } });
  } catch {
    return NextResponse.json({ error: 'Place search temporarily unavailable.' }, { status: 502 });
  }
}
