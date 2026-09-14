export interface Segment {
  operator: 'KMB' | 'LWB' | 'MTR' | 'CTB' | string;
  rideTimeMinutes: number;
  scheduledIntervalMinutes?: number;
  realtimeEtaMinutes?: number;
  isEtaFresh?: boolean;
}

export interface Route {
  segments: Segment[];
  walkTransferTimeMinutes?: number;
  longDistanceTransferSurcharge?: number;
}

export interface ScoreResult {
  finalScore: number;
  legSubtotal: number;
  transferPenalty: number;
  walkTransferTime: number;
  longDistanceSurcharge: number;
}

export class UpgradedScoringEngine {
  public static getOperatorAdjustment(operator: string): number {
    const adjustments: Record<string, number> = {
      KMB: -1.0,
      LWB: -0.46,
      MTR: 0.5,
      CTB: 1.0,
    };
    return adjustments[operator] ?? 0;
  }

  public static getTimeMultiplier(date: Date = new Date()): number {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeInMin = hours * 60 + minutes;

    // 深夜 (23:00 - 05:50)
    if (timeInMin >= 1380 || timeInMin < 350) return 1.8;
    // 繁忙時間 (07:00-09:30 & 17:00-19:30)
    if ((timeInMin >= 420 && timeInMin <= 570) || (timeInMin >= 1020 && timeInMin <= 1170)) return 1.0;
    // 非繁忙時間
    return 1.3;
  }

  public static calculateSegmentScore(segment: Segment, date: Date = new Date()): number {
    const segmentMultiplier = this.getTimeMultiplier(date);
    let etaComponent = 0;

    if (segment.realtimeEtaMinutes !== undefined && segment.isEtaFresh) {
      etaComponent = segment.realtimeEtaMinutes * segmentMultiplier;
    } else {
      const scheduledInterval = segment.scheduledIntervalMinutes ?? 12;
      etaComponent = scheduledInterval * 0.5 * segmentMultiplier;
    }

    const operatorAdjustment = this.getOperatorAdjustment(segment.operator);
    return segment.rideTimeMinutes + etaComponent + operatorAdjustment;
  }

  public static calculateRouteScore(route: Route, date: Date = new Date()): ScoreResult {
    let legSubtotal = 0;
    route.segments.forEach((seg) => {
      legSubtotal += this.calculateSegmentScore(seg, date);
    });

    const transferCount = Math.max(0, route.segments.length - 1);
    const transferPenalty = transferCount * 8;
    const walkTransferTime = route.walkTransferTimeMinutes || 0;
    const longDistanceSurcharge = route.longDistanceTransferSurcharge || 0;

    const finalScore = legSubtotal + walkTransferTime + longDistanceSurcharge + transferPenalty;

    return {
      finalScore: Number(finalScore.toFixed(2)),
      legSubtotal: Number(legSubtotal.toFixed(2)),
      transferPenalty,
      walkTransferTime,
      longDistanceSurcharge,
    };
  }
}
