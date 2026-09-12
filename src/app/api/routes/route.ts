import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getScoredDemoRoutes } from '../../../data/demoRoutes';
import { getMonthlyPassInsight } from '../../../domain/monthlyPass';

export const dynamic = 'force-dynamic';

interface RateLimiterBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

declare global {
  interface CloudflareEnv {
    RATE_LIMITER?: RateLimiterBinding;
  }
}

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
  const { env } = await getCloudflareContext({
    async: true,
  });
  if (env.RATE_LIMITER) {
    const rateLimitResult = await env.RATE_LIMITER.limit({
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
        source: 'demo-data',
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
