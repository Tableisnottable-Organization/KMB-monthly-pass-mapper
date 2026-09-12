import { NextRequest, NextResponse } from 'next/server';
import {
  getCitybusEta,
  getCitybusRoutes,
  getKmbEta,
  getKmbRoutes,
} from '../../../data/hkTransitApi';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare global {
  interface CloudflareEnv {
    RATE_LIMITER?: RateLimiterBinding;
  }
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const ipAddress =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const { env } = await getCloudflareContext({ async: true });
  if (env.RATE_LIMITER) {
    const result = await env.RATE_LIMITER.limit({ key: `transit:${ipAddress}` });
    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many transit data requests. Please try again shortly.' },
        { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
      );
    }
  }

  const operator = request.nextUrl.searchParams.get('operator')?.toUpperCase();
  const stop = request.nextUrl.searchParams.get('stop');
  const route = request.nextUrl.searchParams.get('route');

  if (operator !== 'KMB' && operator !== 'CTB') {
    return badRequest('operator must be KMB or CTB.');
  }
  if ((stop && stop.length > 64) || (route && route.length > 32)) {
    return badRequest('stop or route is too long.');
  }

  try {
    if (stop && route) {
      const data =
        operator === 'KMB'
          ? await getKmbEta(stop, route)
          : await getCitybusEta(stop, route);
      return NextResponse.json({
        data,
        meta: { operator, source: operator === 'KMB' ? 'KMB ETA API' : 'Citybus ETA API', live: true },
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const data =
      operator === 'KMB' ? await getKmbRoutes() : await getCitybusRoutes();
    return NextResponse.json({
      data,
      meta: { operator, source: operator === 'KMB' ? 'KMB route API' : 'Citybus route API', live: true },
    }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Transit provider unavailable.',
      meta: { operator, live: false },
    }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
