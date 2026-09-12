import { scoreRoutes, type RouteOption, type TransitLeg } from '../engine/UpgradedScoringEngine';
import { getMonthlyPassInsight } from '../domain/monthlyPass';
import { MonthlySavingsCounter } from './components/MonthlySavingsCounter';
import { CalendarAndPlaces } from './components/CalendarAndPlaces';

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
    <main className="min-h-screen bg-[#eef7ed] text-slate-900">
      <div className="min-h-screen bg-[linear-gradient(135deg,#eef7ed_0%,#d9f0d5_45%,#f7fbf5_100%)]">
        <header className="border-b border-[#176b2c]/20 bg-[#176b2c] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#176b2c] shadow-lg">
              KMB
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-green-100">
                Monthly Pass Mapper
              </p>
              <h1 className="text-xl font-bold">KMB Journey Map</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20" href="/en">
              English
            </a>
            <button className="hidden rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 sm:block">
              Saved places
            </button>
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#176b2c] shadow-sm">
              Find me
            </button>
          </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-5 rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-[#176b2c]/15">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b2c]">Get me somewhere</p>
              <p className="mt-1 text-sm text-slate-500">Plan around your KMB Monthly Pass</p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#176b2c]">Hong Kong</span>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <span className="flex h-3 w-3 rounded-full bg-[#2e8b57]" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">From</div>
                <div className="text-base font-medium">Jordan</div>
              </div>
            </div>

            <button
              aria-label="Swap trip endpoints"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-500 transition hover:border-[#2e8b57] hover:text-[#176b2c]"
            >
              ⇅
            </button>

            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <span className="flex h-3 w-3 rounded-full bg-orange-500" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">To</div>
                <div className="text-base font-medium">Tsim Sha Tsui</div>
              </div>
            </div>

            <button className="rounded-2xl bg-[#2e8b57] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#176b2c]">
              GO
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {['Bus only', 'KMB pass', 'Fastest', 'Cheapest', 'Live ETA'].map((chip) => (
              <button
                key={chip}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  chip === 'Fastest'
                    ? 'bg-[#176b2c] text-white'
                    : 'bg-green-50 text-[#176b2c] hover:bg-green-100'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-[#176b2c]/10 sm:grid-cols-4">
          {[
            ['🚌', 'Bus', 'KMB first'],
            ['🚶', 'Walk', 'Nearby stops'],
            ['🚇', 'MTR', 'Compare fares'],
            ['⛴', 'Ferry', 'Coming soon'],
          ].map(([icon, label, caption]) => (
            <button key={label} className="rounded-xl px-3 py-3 text-left transition hover:bg-green-50">
              <div className="text-xl">{icon}</div>
              <div className="mt-1 text-sm font-bold text-slate-800">{label}</div>
              <div className="text-[11px] text-slate-500">{caption}</div>
            </button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(360px,1.12fr)]">
          <section className="space-y-4">
            <MonthlySavingsCounter
              savingPerTrip={bestPassInsight.savingThisTrip}
            />

            <div className="rounded-[28px] bg-gradient-to-br from-[#176b2c] to-[#2e8b57] p-5 text-white shadow-soft">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-100">
                    Built for KMB Monthly Pass
                  </p>
                  <h2 className="mt-2 max-w-xl text-2xl font-bold">
                    Make every KMB ride count.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-green-50">
                    This route uses {bestPassInsight.coveredLegCount} pass-covered leg
                    {bestPassInsight.coveredLegCount === 1 ? '' : 's'} and saves an
                    estimated HK$ {bestPassInsight.savingThisTrip.toFixed(2)} versus
                    paying those fares separately.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4 sm:min-w-44">
                  <div className="text-xs uppercase tracking-[0.15em] text-green-100">
                    Pass price
                  </div>
                  <div className="mt-1 text-3xl font-bold">
                    HK$ {bestPassInsight.passPrice}
                  </div>
                  <div className="mt-1 text-xs text-green-100">
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

          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <CalendarAndPlaces />
            <div className="overflow-hidden rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-[#176b2c]/15">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Map</p>
                  <h3 className="text-xl font-semibold">Live network</h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  3 live updates
                </span>
              </div>

              <div className="relative h-[420px] overflow-hidden rounded-[22px] bg-[#b8e3ea] p-4">
                <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(25deg,transparent_46%,#8ac6cf_47%,#8ac6cf_49%,transparent_50%),linear-gradient(115deg,transparent_44%,#a4d2d4_45%,#a4d2d4_47%,transparent_48%)] [background-size:160px_120px,220px_160px]" />
                <div className="absolute left-[10%] top-[12%] h-24 w-44 rotate-12 rounded-[45%] bg-[#91d3de]" />
                <div className="absolute right-[5%] top-[45%] h-28 w-48 -rotate-12 rounded-[45%] bg-[#91d3de]" />
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/40" />
                <div className="absolute left-1/2 top-[30%] h-[150px] w-[3px] -translate-x-1/2 bg-[#176b2c]" />
                <div className="absolute left-[28%] top-[55%] h-[3px] w-[52%] bg-[#2e8b57]" />
                <div className="absolute left-[37%] top-[33%] h-[3px] w-[18%] rotate-42 transform bg-orange-500" />

                <div className="absolute left-[29%] top-[48%] flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                  J
                </div>
                <div className="absolute left-[67%] top-[38%] flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-lg">
                  T
                </div>
                <div className="absolute left-[52%] top-[62%] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-lg">
                  C
                </div>
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2e8b57]" />
                  KMB network view
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-[#176b2c] p-5 text-white shadow-soft">
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
            <div className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-[#176b2c]/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b2c]">Quick access</p>
                  <h3 className="mt-1 text-xl font-bold">Your places</h3>
                </div>
                <button className="text-sm font-semibold text-[#2e8b57]">Edit</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  ['★', 'Home', 'Add address'],
                  ['▣', 'Work', 'Add address'],
                  ['⌖', 'Nearest stop', 'Use GPS'],
                  ['↺', 'Recent trip', 'Jordan → TST'],
                ].map(([icon, label, caption]) => (
                  <button key={label} className="rounded-2xl bg-green-50 p-3 text-left hover:bg-green-100">
                    <div className="text-lg text-[#176b2c]">{icon}</div>
                    <div className="mt-1 text-sm font-bold">{label}</div>
                    <div className="truncate text-xs text-slate-500">{caption}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </main>
  );
}
