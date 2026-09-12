import { NextResponse } from 'next/server';
import { routeUpdates } from '../../../data/trafficAlerts';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    { data: routeUpdates, meta: { source: 'demo-official-notice-shape', generatedAt: new Date().toISOString() } },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } },
  );
}
