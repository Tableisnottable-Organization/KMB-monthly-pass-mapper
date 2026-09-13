import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter } from '../../../lib/cloudflare';
import { getScoredDemoRoutes } from '../../../data/demoRoutes';
import { getMonthlyPassInsight } from '../../../domain/monthlyPass';
import { HK_TRANSIT_API } from '../../../data/hkTransitApi';

export const dynamic = 'force-dynamic';

const MAX_DATE_QUERY_LENGTH = 64;

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  if (dateParam && dateParam.length > MAX_DATE_QUERY_LENGTH) {
    return NextResponse.json(
      { error: 'The date query parameter is too long.' },
      { status: 400 },
    );
  }

  const date = dateParam ? new Date(dateParam) : undefined;

  if (dateParam && Number.isNaN(date?.getTime())) {
    return NextResponse.json(
      { error: 'The date query parameter must be a valid ISO date.' },
      { status: 400 },
    );
  }

  const ipAddress =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  const rateLimiter = await getRateLimiter();
  if (rateLimiter) {
    const rateLimitResult = await rateLimiter.limit({
      key: `routes:${ipAddress}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': '60',
          },
        },
      );
    }
  }

  const routes = getScoredDemoRoutes(date);
  return NextResponse.json(
    {
      data: routes.map((route) => ({
        ...route,
        monthlyPass: getMonthlyPassInsight(route),
      })),
      meta: {
        count: routes.length,
        generatedAt: new Date().toISOString(),
        source: 'scored-demo-routes',
        liveFeeds: {
          kmb: `${HK_TRANSIT_API.kmb}/eta/{stop_id}/{route}`,
          citybus: `${HK_TRANSIT_API.citybus}/eta/CTB/{stop_id}/{route}`,
          connected: true,
          note: 'Use /api/transit for validated KMB and Citybus route/ETA payloads.',
        },
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
