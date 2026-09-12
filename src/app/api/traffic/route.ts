import { NextResponse } from 'next/server';
import { trafficEvents } from '../../../data/trafficAlerts';

export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    { data: trafficEvents, meta: { source: 'demo-transport-event-shape', generatedAt: new Date().toISOString() } },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } },
  );
}
