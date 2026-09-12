import { NextRequest, NextResponse } from 'next/server';
import { getScoredDemoRoutes } from '../../../data/demoRoutes';
import { getMonthlyPassInsight } from '../../../domain/monthlyPass';

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
    data: routes.map((route) => ({
      ...route,
      monthlyPass: getMonthlyPassInsight(route),
    })),
    meta: {
      count: routes.length,
      generatedAt: new Date().toISOString(),
      source: 'demo-data',
    },
  });
}
