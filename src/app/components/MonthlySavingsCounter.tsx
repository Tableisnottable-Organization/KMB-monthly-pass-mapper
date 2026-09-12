'use client';

import { useMemo, useState } from 'react';
import {
  KMB_MONTHLY_PASS_PRICES,
  type MonthlyPassType,
} from '../../domain/monthlyPass';
import { demoRoutes } from '../../data/demoRoutes';

interface MonthlySavingsCounterProps {
  savingPerTrip: number;
}

export function MonthlySavingsCounter({
  savingPerTrip,
}: MonthlySavingsCounterProps) {
  const [tripCount, setTripCount] = useState(0);
  const [passType, setPassType] = useState<MonthlyPassType>('NORMAL');
  const [startDate, setStartDate] = useState('');
  const [locationStatus, setLocationStatus] = useState('Find nearest stop');
  const [nearestStop, setNearestStop] = useState<string | null>(null);
  const selectedPassPrice = KMB_MONTHLY_PASS_PRICES[passType];

  const totals = useMemo(() => {
    const coveredFare = tripCount * savingPerTrip;
    const selectedBreakEvenTrips = Math.ceil(
      selectedPassPrice / Math.max(savingPerTrip, 0.01),
    );
    const netSaving = coveredFare - selectedPassPrice;
    const tripsRemaining = Math.max(0, selectedBreakEvenTrips - tripCount);
    const elapsedDays = startDate
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(`${startDate}T00:00:00`).getTime()) /
              86400000,
          ),
        )
      : 0;

    return {
      coveredFare,
      netSaving,
      tripsRemaining,
      selectedBreakEvenTrips,
      elapsedDays,
    };
  }, [savingPerTrip, startDate, tripCount, selectedPassPrice]);

  function findNearestStop() {
    if (!navigator.geolocation) {
      setLocationStatus('GPS is not supported by this browser');
      return;
    }

    setLocationStatus('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const stops = Array.from(
          new Map(
            demoRoutes.flatMap((route) =>
              route.legs.flatMap((leg) => [
                leg.originStop,
                leg.destinationStop,
              ]),
            ).map((stop) => [stop.id, stop]),
          ).values(),
        );
        const closest = stops.reduce((nearest, stop) => {
          const distance = Math.hypot(
            (stop.lat - coords.latitude) * 111,
            (stop.lng - coords.longitude) * 102,
          );
          return distance < nearest.distance
            ? { stop, distance }
            : nearest;
        }, { stop: stops[0], distance: Number.POSITIVE_INFINITY });
        setNearestStop(closest.stop.name);
        setLocationStatus('Nearest stop found');
      },
      () => setLocationStatus('Location permission was not granted'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <section id="pass" className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-slate-200 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            月票節省追蹤
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            今個月慳咗幾多？
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            輸入今個月九巴乘搭次數，查看月票實際價值。
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            aria-label="Monthly pass type"
            className="rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
            onChange={(event) =>
              setPassType(event.target.value as MonthlyPassType)
            }
            value={passType}
          >
            <option value="NORMAL">普通月票</option>
            <option value="STUDENT">學生月票</option>
          </select>
          <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
            <span className="text-sm font-medium text-slate-600">乘搭</span>
            <input
              aria-label="KMB trips this month"
              className="w-16 rounded-xl border-0 bg-white px-2 py-1 text-center text-lg font-bold text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-400"
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
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">月票開始日期</span>
          <input
            aria-label="Monthly pass start date"
            className="rounded-lg border-0 bg-white px-2 py-1.5 text-sm ring-1 ring-slate-200"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
          {startDate && (
            <span className="text-xs text-slate-400">
              Day {totals.elapsedDays + 1}
            </span>
          )}
        </label>
        <button
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          onClick={findNearestStop}
          type="button"
        >
          {locationStatus === 'Find nearest stop' ? '尋找最近車站' : locationStatus}
        </button>
      </div>
      {nearestStop && (
        <div className="mt-2 text-sm text-slate-500">
          Nearest mapped stop: <strong className="text-slate-800">{nearestStop}</strong>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-orange-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-orange-700">
            淨節省
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-900">
            HK$ {Math.max(0, totals.netSaving).toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-orange-700">
            扣除 HK$ {selectedPassPrice}{passType === 'STUDENT' ? '學生' : '普通'}月票成本
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-700">
            已涵蓋車費
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
            回本進度
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-900">
            {totals.tripsRemaining === 0 ? 'Reached' : `${totals.tripsRemaining} trips`}
          </div>
          <div className="mt-1 text-xs text-blue-700">
            {totals.tripsRemaining === 0
              ? '月票已經回本'
              : `共需 ${totals.selectedBreakEvenTrips} 程`}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-emerald-500 transition-all"
          style={{
            width: `${Math.min(100, (tripCount / totals.selectedBreakEvenTrips) * 100)}%`,
          }}
        />
      </div>
    </section>
  );
}
