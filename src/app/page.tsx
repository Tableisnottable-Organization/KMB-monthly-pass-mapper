import { scoreRoutes, type RouteOption, type TransitLeg } from '../engine/UpgradedScoringEngine';
import { getMonthlyPassInsight } from '../domain/monthlyPass';

const stop = (
  id: string,
  name: string,
  lat: number,
  lng: number,
): { id: string; name: string; lat: number; lng: number } => ({
  id,
  name,
  lat,
  lng,
});

const makeLeg = (
  id: string,
  operator: RouteOption['legs'][number]['operator'],
  mode: RouteOption['legs'][number]['mode'],
  routeNumber: string,
  from: { id: string; name: string; lat: number; lng: number },
  to: { id: string; name: string; lat: number; lng: number },
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
  realtimeEta: eta
    ? {
        etaMinutes: eta,
        dataTime: '2026-09-13T18:25:00+08:00',
        isLive: true,
        source: 'DATAGOVHK',
      }
    : null,
  fare,
});

const routes: RouteOption[] = [
  {
    id: 'route-best',
    walkTransferTimeMinutes: 4,
    transferCount: 1,
    legs: [
      makeLeg(
        'leg-1',
        'KMB',
        'BUS',
        '5',
        stop('s1', 'Jordan', 22.3044, 114.1718),
        stop('s2', 'Central', 22.2819, 114.1581),
        18,
        9,
        18.5,
        7,
      ),
      makeLeg(
        'leg-2',
        'MTR',
        'SUBWAY',
        'Island Line',
        stop('s3', 'Central', 22.2819, 114.1581),
        stop('s4', 'Tsim Sha Tsui', 22.2971, 114.1742),
        13,
        6,
        20,
        6,
      ),
    ],
  },
  {
    id: 'route-faster',
    walkTransferTimeMinutes: 2,
    transferCount: 0,
    legs: [
      makeLeg(
        'leg-3',
        'MTR',
        'SUBWAY',
        'Tsuen Wan Line',
        stop('s5', 'Jordan', 22.3044, 114.1718),
        stop('s6', 'Tsim Sha Tsui', 22.2971, 114.1742),
        27,
        5,
        22.5,
        11,
      ),
    ],
  },
  {
    id: 'route-cheap',
    walkTransferTimeMinutes: 8,
    transferCount: 2,
    legs: [
      makeLeg(
        'leg-4',
        'CTB',
        'BUS',
        '970',
        stop('s7', 'Jordan', 22.3044, 114.1718),
        stop('s8', 'Causeway Bay', 22.2795, 114.1839),
        23,
        12,
        19.5,
        10,
      ),
      makeLeg(
        'leg-5',
        'CTB',
        'BUS',
        '37A',
        stop('s9', 'Causeway Bay', 22.2795, 114.1839),
        stop('s10', 'Tsim Sha Tsui', 22.2971, 114.1742),
        16,
        10,
        17,
        null,
      ),
    ],
  },
];

const scoredRoutes = scoreRoutes(routes, new Date('2026-09-13T18:25:00+08:00')).sort(
  (a, b) => a.finalScore - b.finalScore,
);

const bestRoute = scoredRoutes[0];
const bestPassInsight = getMonthlyPassInsight(bestRoute);

const operatorClasses: Record<string, string> = {
  KMB: 'bg-amber-100 text-amber-700',
  LWB: 'bg-sky-100 text-sky-700',
  MTR: 'bg-blue-100 text-blue-700',
  CTB: 'bg-emerald-100 text-emerald-700',
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} min`;
  }
  return `${hours}h ${mins}m`;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-slate-950 px-5 py-4 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
              K
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                Route Planner
              </p>
              <h1 className="text-xl font-semibold">KMB Journey Map</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Live status
          </div>
        </header>

        <section className="mb-6 rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <span className="flex h-3 w-3 rounded-full bg-blue-500" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">From</div>
                <div className="text-base font-medium">Jordan</div>
              </div>
            </div>

            <button
              aria-label="Swap trip endpoints"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            >
              ⇅
            </button>

            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">To</div>
                <div className="text-base font-medium">Tsim Sha Tsui</div>
              </div>
            </div>

            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Fastest', 'Cheapest', 'Fewest transfers', 'Live ETA', 'Accessible'].map((chip) => (
              <button
                key={chip}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  chip === 'Fastest'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-soft">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
                    Built for KMB Monthly Pass
                  </p>
                  <h2 className="mt-2 max-w-xl text-2xl font-bold">
                    Make every KMB ride count.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50">
                    This route uses {bestPassInsight.coveredLegCount} pass-covered leg
                    {bestPassInsight.coveredLegCount === 1 ? '' : 's'} and saves an
                    estimated HK$ {bestPassInsight.savingThisTrip.toFixed(2)} versus
                    paying those fares separately.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 sm:min-w-44">
                  <div className="text-xs uppercase tracking-[0.15em] text-orange-100">
                    Pass price
                  </div>
                  <div className="mt-1 text-3xl font-bold">
                    HK$ {bestPassInsight.passPrice}
                  </div>
                  <div className="mt-1 text-xs text-orange-100">
                    Break-even: {bestPassInsight.breakEvenTrips} trips
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[24px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recommended</p>
                <h2 className="text-2xl font-semibold text-slate-900">{bestRoute.legs.length > 1 ? 'Best route' : 'Direct route'}</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{bestRoute.legs.reduce((total, leg) => total + leg.journeyTimeMinutes, 0) + bestRoute.walkTransferTimeMinutes} min</div>
                <div className="text-sm text-slate-500">{bestRoute.transferCount} transfer{bestRoute.transferCount === 1 ? '' : 's'}</div>
              </div>
            </div>

            {scoredRoutes.map((route, index) => {
              const isBest = index === 0;
              const totalMinutes = route.legs.reduce((total, leg) => total + leg.journeyTimeMinutes, 0) + route.walkTransferTimeMinutes;
              return (
                <article
                  key={route.id}
                  className={`rounded-[28px] border p-4 shadow-soft transition ${
                    isBest
                      ? 'border-sky-200 bg-sky-50/80'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {isBest && (
                        <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                          Best
                        </span>
                      )}
                      <div>
                        <div className="text-3xl font-bold text-slate-900">{totalMinutes} min</div>
                        <div className="text-sm text-slate-500">{route.legs.length} leg{route.legs.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-600">Score</div>
                      <div className="text-2xl font-bold text-slate-900">{route.finalScore.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {route.legs.map((leg) => (
                      <div key={leg.id} className="flex items-start gap-3 rounded-2xl bg-white/60 p-3 ring-1 ring-slate-200">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${operatorClasses[leg.operator] ?? 'bg-slate-100 text-slate-700'}`}
                        >
                          {leg.operator}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-slate-900">{leg.routeNumber}</div>
                            <div className="text-sm text-slate-500">{leg.mode}</div>
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {leg.originStop.name} → {leg.destinationStop.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{leg.journeyTimeMinutes} min</div>
                          <div className="text-xs text-slate-500">
                            {leg.realtimeEta ? `${leg.realtimeEta.etaMinutes} min live` : `${leg.scheduledIntervalMinutes} min scheduled`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        HK$ {route.discountedFare.toFixed(2)}
                      </span>
                      <span className="text-slate-500">BBI {route.bbiDiscountApplied.toFixed(2)} off</span>
                    </div>
                    <div className="font-medium text-slate-800">Walk {route.walkTransferTimeMinutes} min</div>
                  </div>
                  {(() => {
                    const passInsight = getMonthlyPassInsight(route);
                    return (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-xs text-orange-800">
                        <span className="font-semibold">
                          {passInsight.isFullyCovered
                            ? 'Fully covered by KMB Monthly Pass'
                            : `${passInsight.coveredLegCount} pass-covered leg${passInsight.coveredLegCount === 1 ? '' : 's'}`}
                        </span>
                        <span>
                          Save HK$ {passInsight.savingThisTrip.toFixed(2)} on this trip
                        </span>
                      </div>
                    );
                  })()}
                </article>
              );
            })}
          </section>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Map</p>
                  <h3 className="text-xl font-semibold">Live network</h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  3 live updates
                </span>
              </div>

              <div className="relative h-[320px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_58%,_#edf2f7)] p-4">
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/40" />
                <div className="absolute left-1/2 top-[30%] h-[150px] w-[2px] -translate-x-1/2 bg-slate-300" />
                <div className="absolute left-[28%] top-[55%] h-[2px] w-[52%] bg-slate-300" />
                <div className="absolute left-[37%] top-[33%] h-[2px] w-[18%] rotate-42 transform bg-slate-300" />

                <div className="absolute left-[29%] top-[48%] flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                  J
                </div>
                <div className="absolute left-[67%] top-[38%] flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-lg">
                  T
                </div>
                <div className="absolute left-[52%] top-[62%] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-lg">
                  C
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Trip summary</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total time</span>
                  <strong>{formatDuration(bestRoute.legs.reduce((total, leg) => total + leg.journeyTimeMinutes, 0) + bestRoute.walkTransferTimeMinutes)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Best price</span>
                  <strong>HK$ {bestRoute.discountedFare.toFixed(2)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Pass saving</span>
                  <strong className="text-orange-300">
                    HK$ {bestPassInsight.savingThisTrip.toFixed(2)}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Live ETA</span>
                  <strong>{bestRoute.legs[0].realtimeEta?.etaMinutes ?? bestRoute.legs[0].scheduledIntervalMinutes} min</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Operator mix</span>
                  <strong>{bestRoute.legs.map((leg) => leg.operator).join(' + ')}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
