export type AlertSeverity = 'INFO' | 'MINOR' | 'MAJOR' | 'CRITICAL';
export type AlertKind = 'ROUTE_UPDATE' | 'TRAFFIC_EVENT';

export interface RouteUpdate {
  id: string;
  kind: 'ROUTE_UPDATE';
  routeNumbers: string[];
  operator: 'KMB' | 'LWB' | 'MTR' | 'CTB';
  title: string;
  summary: string;
  details: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  publishedAt: string;
  severity: AlertSeverity;
  sourceName: string;
  sourceUrl: string;
}

export interface TrafficEvent {
  id: string;
  kind: 'TRAFFIC_EVENT';
  title: string;
  location: string;
  summary: string;
  details: string;
  affectedRouteNumbers: string[];
  startedAt: string;
  expectedEndAt: string | null;
  updatedAt: string;
  severity: AlertSeverity;
  sourceName: string;
  sourceUrl: string;
}

export const routeUpdates: readonly RouteUpdate[] = [
  {
    id: 'update-5-jordan-central',
    kind: 'ROUTE_UPDATE',
    routeNumbers: ['5'],
    operator: 'KMB',
    title: 'Route 5 temporary stop arrangement',
    summary: 'Temporary stop arrangement near Central during road works.',
    details: 'Passengers should allow extra walking time and check the stop display before boarding.',
    effectiveFrom: '2026-09-13T06:00:00+08:00',
    effectiveTo: '2026-09-20T23:59:00+08:00',
    publishedAt: '2026-09-12T18:00:00+08:00',
    severity: 'MINOR',
    sourceName: 'KMB official notices',
    sourceUrl: 'https://www.kmb.hk/',
  },
  {
    id: 'update-970-weekend',
    kind: 'ROUTE_UPDATE',
    routeNumbers: ['970'],
    operator: 'CTB',
    title: 'Route 970 weekend timetable update',
    summary: 'Selected weekend departures have a revised timetable.',
    details: 'The route remains in service. Check the latest departure time before leaving.',
    effectiveFrom: '2026-09-14T00:00:00+08:00',
    effectiveTo: null,
    publishedAt: '2026-09-11T12:00:00+08:00',
    severity: 'INFO',
    sourceName: 'Citybus official notices',
    sourceUrl: 'https://www.citybus.com.hk/',
  },
];

export const trafficEvents: readonly TrafficEvent[] = [
  {
    id: 'event-central-roadworks',
    kind: 'TRAFFIC_EVENT',
    title: 'Central road works',
    location: 'Central, Hong Kong Island',
    summary: 'Slow traffic and temporary lane restrictions are reported.',
    details: 'Expect longer journey times around the Central interchange. Routes 5 and Island Line may be affected.',
    affectedRouteNumbers: ['5', 'Island Line'],
    startedAt: '2026-09-13T07:30:00+08:00',
    expectedEndAt: '2026-09-13T21:00:00+08:00',
    updatedAt: '2026-09-13T18:20:00+08:00',
    severity: 'MAJOR',
    sourceName: 'Hong Kong Transport Department',
    sourceUrl: 'https://www.td.gov.hk/',
  },
  {
    id: 'event-causeway-bay',
    kind: 'TRAFFIC_EVENT',
    title: 'Causeway Bay traffic congestion',
    location: 'Causeway Bay',
    summary: 'Traffic is heavier than usual near the shopping district.',
    details: 'Allow additional time for routes 970 and 37A. Live ETA may change quickly.',
    affectedRouteNumbers: ['970', '37A'],
    startedAt: '2026-09-13T17:45:00+08:00',
    expectedEndAt: null,
    updatedAt: '2026-09-13T18:15:00+08:00',
    severity: 'MINOR',
    sourceName: 'Hong Kong Transport Department',
    sourceUrl: 'https://www.td.gov.hk/',
  },
];

export function getAlertsForRoutes(routeNumbers: readonly string[]) {
  const numbers = new Set(routeNumbers);
  return [
    ...routeUpdates.filter((update) => update.routeNumbers.some((number) => numbers.has(number))),
    ...trafficEvents.filter((event) => event.affectedRouteNumbers.some((number) => numbers.has(number))),
  ];
}
