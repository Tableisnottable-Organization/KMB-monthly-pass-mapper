export type Operator = 'KMB' | 'LWB' | 'MTR' | 'CTB';

export type RouteMode = 'BUS' | 'SUBWAY' | 'WALK' | 'FERRY';

export interface RealtimeEta {
  etaMinutes: number;
  dataTime: string;
  isLive: boolean;
  source: 'DATAGOVHK' | 'SCHEDULED';
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface TransitLeg {
  id: string;
  operator: Operator;
  mode: RouteMode;
  routeNumber: string;
  originStop: Stop;
  destinationStop: Stop;
  journeyTimeMinutes: number;
  scheduledIntervalMinutes: number;
  realtimeEta: RealtimeEta | null;
  fare: number;
}

export interface RouteOption {
  id: string;
  legs: TransitLeg[];
  walkTransferTimeMinutes: number;
  transferCount: number;
}

export interface LegScoreBreakdown {
  legId: string;
  routeNumber: string;
  operator: Operator;
  mode: RouteMode;
  journeyTimeMinutes: number;
  scheduledIntervalMinutes: number;
  realtimeEtaMinutes: number | null;
  etaComponent: number;
  operatorPenalty: number;
  total: number;
}

export interface ScoreBreakdown {
  segmentMultiplier: number;
  timePeriod: 'PEAK' | 'OFF_PEAK' | 'LATE_NIGHT';
  legs: LegScoreBreakdown[];
  walkTransferTimeMinutes: number;
  longDistanceTransferSurcharge: number;
  effectiveWalkTransferPenalty: number;
  transferCount: number;
  transferPenalty: number;
  legSubtotal: number;
  finalScore: number;
}

export interface ScoredRoute extends RouteOption {
  finalScore: number;
  discountedFare: number;
  bbiDiscountApplied: number;
  breakdown: ScoreBreakdown;
}

export interface ScoringEngineOptions {
  bbiMaximumDiscount?: number;
  longDistanceTransferSurcharge?: number;
  longDistanceTransferDistanceKm?: number;
  transferPenaltyMinutes?: number;
}

const OPERATOR_PENALTIES: Readonly<Record<Operator, number>> = {
  KMB: -1,
  LWB: -0.46,
  MTR: 0.5,
  CTB: 1,
};

const DEFAULT_BBI_MAXIMUM_DISCOUNT = 4.2;
const DEFAULT_LONG_DISTANCE_TRANSFER_SURCHARGE = 3;
const DEFAULT_LONG_DISTANCE_TRANSFER_DISTANCE_KM = 0.75;
const DEFAULT_TRANSFER_PENALTY_MINUTES = 8;
const EARTH_RADIUS_KM = 6371;

type TimePeriod = ScoreBreakdown['timePeriod'];

/**
 * Scores route options using journey time, service frequency, operator preference,
 * transfer friction, real-time ETA data, and Hong Kong BBI fare rules.
 */
export class UpgradedScoringEngine {
  private readonly bbiMaximumDiscount: number;
  private readonly longDistanceTransferSurcharge: number;
  private readonly longDistanceTransferDistanceKm: number;
  private readonly transferPenaltyMinutes: number;

  public constructor(options: ScoringEngineOptions = {}) {
    this.bbiMaximumDiscount = this.validateNonNegative(
      options.bbiMaximumDiscount ?? DEFAULT_BBI_MAXIMUM_DISCOUNT,
      'bbiMaximumDiscount',
    );
    this.longDistanceTransferSurcharge = this.validateNonNegative(
      options.longDistanceTransferSurcharge ?? DEFAULT_LONG_DISTANCE_TRANSFER_SURCHARGE,
      'longDistanceTransferSurcharge',
    );
    this.longDistanceTransferDistanceKm = this.validateNonNegative(
      options.longDistanceTransferDistanceKm ?? DEFAULT_LONG_DISTANCE_TRANSFER_DISTANCE_KM,
      'longDistanceTransferDistanceKm',
    );
    this.transferPenaltyMinutes = this.validateNonNegative(
      options.transferPenaltyMinutes ?? DEFAULT_TRANSFER_PENALTY_MINUTES,
      'transferPenaltyMinutes',
    );
  }

  public scoreRoute(route: RouteOption, date: Date = new Date()): ScoredRoute {
    this.validateRoute(route);
    this.validateDate(date);

    const { multiplier, period } = getSegmentMultiplier(date);
    const legs = route.legs.map((leg) => this.scoreLeg(leg, multiplier));
    const legSubtotal = legs.reduce((sum, leg) => sum + leg.total, 0);
    const longDistanceTransferSurcharge = this.hasLongDistanceTransfer(route)
      ? this.longDistanceTransferSurcharge
      : 0;
    const effectiveWalkTransferPenalty =
      route.walkTransferTimeMinutes + longDistanceTransferSurcharge;
    const transferPenalty = route.transferCount * this.transferPenaltyMinutes;
    const finalScore =
      legSubtotal + effectiveWalkTransferPenalty + transferPenalty;
    const { discountedFare, bbiDiscountApplied } = this.calculateFare(route.legs);

    return {
      ...route,
      finalScore,
      discountedFare,
      bbiDiscountApplied,
      breakdown: {
        segmentMultiplier: multiplier,
        timePeriod: period,
        legs,
        walkTransferTimeMinutes: route.walkTransferTimeMinutes,
        longDistanceTransferSurcharge,
        effectiveWalkTransferPenalty,
        transferCount: route.transferCount,
        transferPenalty,
        legSubtotal,
        finalScore,
      },
    };
  }

  public scoreRoutes(
    routes: readonly RouteOption[],
    date: Date = new Date(),
  ): ScoredRoute[] {
    return routes.map((route) => this.scoreRoute(route, date));
  }

  public calculateFare(legs: readonly TransitLeg[]): {
    discountedFare: number;
    bbiDiscountApplied: number;
  } {
    let grossFare = 0;
    let bbiDiscountApplied = 0;
    let previousDiscountEligibleOperator: Operator | null = null;

    for (const leg of legs) {
      const fare = this.validateMoney(leg.fare, `fare for leg ${leg.id}`);
      grossFare += fare;

      if (
        previousDiscountEligibleOperator !== null &&
        isSameBbiGroup(previousDiscountEligibleOperator, leg.operator)
      ) {
        const discount = Math.min(this.bbiMaximumDiscount, fare);
        bbiDiscountApplied += discount;
      }

      previousDiscountEligibleOperator = isBbiOperator(leg.operator)
        ? leg.operator
        : null;
    }

    return {
      discountedFare: this.roundCurrency(Math.max(0, grossFare - bbiDiscountApplied)),
      bbiDiscountApplied: this.roundCurrency(bbiDiscountApplied),
    };
  }

  private scoreLeg(
    leg: TransitLeg,
    segmentMultiplier: number,
  ): LegScoreBreakdown {
    const journeyTimeMinutes = this.validateNonNegative(
      leg.journeyTimeMinutes,
      `journeyTimeMinutes for leg ${leg.id}`,
    );
    const scheduledIntervalMinutes = this.validateNonNegative(
      leg.scheduledIntervalMinutes,
      `scheduledIntervalMinutes for leg ${leg.id}`,
    );
    const realtimeEtaMinutes = this.getLiveEta(leg);
    const etaComponent =
      realtimeEtaMinutes ??
      scheduledIntervalMinutes * 0.5 * segmentMultiplier;
    const operatorPenalty = OPERATOR_PENALTIES[leg.operator];

    return {
      legId: leg.id,
      routeNumber: leg.routeNumber,
      operator: leg.operator,
      mode: leg.mode,
      journeyTimeMinutes,
      scheduledIntervalMinutes,
      realtimeEtaMinutes,
      etaComponent,
      operatorPenalty,
      total: journeyTimeMinutes + etaComponent + operatorPenalty,
    };
  }

  private getLiveEta(leg: TransitLeg): number | null {
    if (leg.realtimeEta === null || !leg.realtimeEta.isLive) {
      return null;
    }

    return this.validateNonNegative(
      leg.realtimeEta.etaMinutes,
      `realtime ETA for leg ${leg.id}`,
    );
  }

  private hasLongDistanceTransfer(route: RouteOption): boolean {
    if (route.legs.length < 2) {
      return false;
    }

    return route.legs.some((leg, index) => {
      if (index === 0) {
        return false;
      }

      const previousLeg = route.legs[index - 1];
      return (
        isCentralHongKongStationTransfer(
          previousLeg.destinationStop,
          leg.originStop,
        ) ||
        haversineDistanceKm(
          previousLeg.destinationStop,
          leg.originStop,
        ) >= this.longDistanceTransferDistanceKm
      );
    });
  }

  private validateRoute(route: RouteOption): void {
    if (!route.id.trim()) {
      throw new Error('Route id must not be empty.');
    }
    if (!Number.isFinite(route.walkTransferTimeMinutes) || route.walkTransferTimeMinutes < 0) {
      throw new Error('walkTransferTimeMinutes must be a finite non-negative number.');
    }
    if (!Number.isInteger(route.transferCount) || route.transferCount < 0) {
      throw new Error('transferCount must be a non-negative integer.');
    }
    if (route.legs.length === 0) {
      throw new Error('A route must contain at least one leg.');
    }
  }

  private validateDate(date: Date): void {
    if (Number.isNaN(date.getTime())) {
      throw new Error('date must be a valid Date.');
    }
  }

  private validateNonNegative(value: number, field: string): number {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${field} must be a finite non-negative number.`);
    }
    return value;
  }

  private validateMoney(value: number, field: string): number {
    return this.validateNonNegative(value, field);
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

export function getSegmentMultiplier(date: Date): {
  multiplier: number;
  period: TimePeriod;
} {
  if (Number.isNaN(date.getTime())) {
    throw new Error('date must be a valid Date.');
  }

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (isWithinTimeRange(minutes, 23 * 60, 24 * 60) || isWithinTimeRange(minutes, 0, 5 * 60 + 50)) {
    return { multiplier: 1.8, period: 'LATE_NIGHT' };
  }
  if (
    isWithinTimeRange(minutes, 7 * 60, 9 * 60 + 30) ||
    isWithinTimeRange(minutes, 17 * 60, 19 * 60 + 30)
  ) {
    return { multiplier: 1, period: 'PEAK' };
  }
  return { multiplier: 1.3, period: 'OFF_PEAK' };
}

function isWithinTimeRange(
  minutes: number,
  startInclusive: number,
  endInclusive: number,
): boolean {
  return minutes >= startInclusive && minutes <= endInclusive;
}

function isBbiOperator(operator: Operator): boolean {
  return operator === 'KMB' || operator === 'LWB' || operator === 'CTB';
}

function isSameBbiGroup(first: Operator, second: Operator): boolean {
  const kmbGroup: ReadonlyArray<Operator> = ['KMB', 'LWB'];
  return (
    (kmbGroup.includes(first) && kmbGroup.includes(second)) ||
    (first === 'CTB' && second === 'CTB')
  );
}

function isCentralHongKongStationTransfer(first: Stop, second: Stop): boolean {
  const stationNames = [first.name, second.name].map((name) =>
    name.toLocaleLowerCase(),
  );
  const hasCentral = stationNames.some((name) => name.includes('central') || name.includes('中環'));
  const hasHongKong = stationNames.some(
    (name) =>
      name.includes('hong kong') ||
      name.includes('hongkong') ||
      name.includes('香港站') ||
      name.includes('香港'),
  );
  return hasCentral && hasHongKong;
}

function haversineDistanceKm(first: Stop, second: Stop): number {
  const latitudeDelta = degreesToRadians(second.lat - first.lat);
  const longitudeDelta = degreesToRadians(second.lng - first.lng);
  const firstLatitude = degreesToRadians(first.lat);
  const secondLatitude = degreesToRadians(second.lat);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export const defaultUpgradedScoringEngine = new UpgradedScoringEngine();

export function scoreRoute(
  route: RouteOption,
  date: Date = new Date(),
): ScoredRoute {
  return defaultUpgradedScoringEngine.scoreRoute(route, date);
}

export function scoreRoutes(
  routes: readonly RouteOption[],
  date: Date = new Date(),
): ScoredRoute[] {
  return defaultUpgradedScoringEngine.scoreRoutes(routes, date);
}
