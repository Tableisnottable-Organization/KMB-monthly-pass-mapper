'use client';

import { useMemo, useState } from 'react';

interface MonthlySavingsCounterProps {
  passPrice: number;
  savingPerTrip: number;
  breakEvenTrips: number;
}

export function MonthlySavingsCounter({
  passPrice,
  savingPerTrip,
  breakEvenTrips,
}: MonthlySavingsCounterProps) {
  const [tripCount, setTripCount] = useState(0);

  const totals = useMemo(() => {
    const coveredFare = tripCount * savingPerTrip;
    const netSaving = Math.max(0, coveredFare - passPrice);
    const tripsRemaining = Math.max(0, breakEvenTrips - tripCount);

    return {
      coveredFare,
      netSaving,
      tripsRemaining,
    };
  }, [breakEvenTrips, passPrice, savingPerTrip, tripCount]);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft ring-1 ring-slate-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Monthly pass tracker
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            How much have you saved?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Count your KMB rides this month to see your real pass value.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
          <span className="text-sm font-medium text-slate-600">KMB trips</span>
          <input
            aria-label="KMB trips this month"
            className="w-20 rounded-xl border-0 bg-white px-3 py-2 text-center text-lg font-bold text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-400"
            min="0"
            onChange={(event) =>
              setTripCount(
                Math.max(0, Math.floor(Number(event.target.value) || 0)),
              )
            }
            type="number"
            value={tripCount}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-orange-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-orange-700">
            Net saved
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-900">
            HK$ {totals.netSaving.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-orange-700">
            after HK$ {passPrice} pass cost
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-700">
            Covered fares
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-900">
            HK$ {totals.coveredFare.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            {tripCount} trip{tripCount === 1 ? '' : 's'} counted
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-blue-700">
            Break-even
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-900">
            {totals.tripsRemaining === 0 ? 'Reached' : `${totals.tripsRemaining} trips`}
          </div>
          <div className="mt-1 text-xs text-blue-700">
            {totals.tripsRemaining === 0
              ? 'Your pass has paid for itself'
              : `until ${breakEvenTrips} total trips`}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-emerald-500 transition-all"
          style={{
            width: `${Math.min(100, (tripCount / breakEvenTrips) * 100)}%`,
          }}
        />
      </div>
    </section>
  );
}
