import {
  scoreRoutes,
  type RouteOption,
  type TransitLeg,
} from '../engine/UpgradedScoringEngine';

type Stop = TransitLeg['originStop'];

const stop = (id: string, name: string, lat: number, lng: number): Stop => ({
  id,
  name,
  lat,
  lng,
});

const makeLeg = (
  id: string,
  operator: TransitLeg['operator'],
  mode: TransitLeg['mode'],
  routeNumber: string,
  from: Stop,
  to: Stop,
  journeyTimeMinutes: number,
  scheduledIntervalMinutes: number,
  fare: number,
  eta: number | null,
): TransitLeg => ({
  id,
  operator,
  mode,
  routeNumber,
  originStop: from,
  destinationStop: to,
  journeyTimeMinutes,
  scheduledIntervalMinutes,
  realtimeEta: null,
  fare,
});

export const demoRoutes: RouteOption[] = [
  {
    id: 'route-best',
    walkTransferTimeMinutes: 4,
    transferCount: 1,
    legs: [
      makeLeg('leg-1', 'KMB', 'BUS', '5', stop('s1', 'Jordan', 22.3044, 114.1718), stop('s2', 'Central', 22.2819, 114.1581), 18, 9, 18.5, 7),
      makeLeg('leg-2', 'MTR', 'SUBWAY', 'Island Line', stop('s3', 'Central', 22.2819, 114.1581), stop('s4', 'Tsim Sha Tsui', 22.2971, 114.1742), 13, 6, 20, 6),
    ],
  },
  {
    id: 'route-faster',
    walkTransferTimeMinutes: 2,
    transferCount: 0,
    legs: [
      makeLeg('leg-3', 'MTR', 'SUBWAY', 'Tsuen Wan Line', stop('s5', 'Jordan', 22.3044, 114.1718), stop('s6', 'Tsim Sha Tsui', 22.2971, 114.1742), 27, 5, 22.5, 11),
    ],
  },
  {
    id: 'route-cheap',
    walkTransferTimeMinutes: 8,
    transferCount: 2,
    legs: [
      makeLeg('leg-4', 'CTB', 'BUS', '970', stop('s7', 'Jordan', 22.3044, 114.1718), stop('s8', 'Causeway Bay', 22.2795, 114.1839), 23, 12, 19.5, 10),
      makeLeg('leg-5', 'CTB', 'BUS', '37A', stop('s9', 'Causeway Bay', 22.2795, 114.1839), stop('s10', 'Tsim Sha Tsui', 22.2971, 114.1742), 16, 10, 17, null),
    ],
  },
];

export function getScoredDemoRoutes(date = new Date('2026-09-13T18:25:00+08:00')) {
  return scoreRoutes(demoRoutes, date).sort((a, b) => a.finalScore - b.finalScore);
}
