import { NextRequest, NextResponse } from 'next/server';
import { getScoredDemoRoutes } from '../../../data/demoRoutes';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : undefined;

  if (dateParam && Number.isNaN(date?.getTime())) {
    return NextResponse.json(
      { error: 'The date query parameter must be a valid ISO date.' },
      { status: 400 },
    );
  }

  const routes = getScoredDemoRoutes(date);
  return NextResponse.json({
    data: routes,
    meta: {
      count: routes.length,
      generatedAt: new Date().toISOString(),
      source: 'demo-data',
    },
  });
}
