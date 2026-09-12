'use client';

import { useState } from 'react';
import { demoRoutes } from '../../data/demoRoutes';

const heatPoints = [
  { left: '24%', top: '58%', intensity: 'high', label: '九龍' },
  { left: '48%', top: '43%', intensity: 'medium', label: '中環' },
  { left: '72%', top: '34%', intensity: 'high', label: '銅鑼灣' },
  { left: '62%', top: '72%', intensity: 'low', label: '香港仔' },
];

function getMapPosition(latitude: number, longitude: number) {
  const left = Math.max(4, Math.min(96, ((longitude - 114.08) / 0.24) * 100));
  const top = Math.max(6, Math.min(94, ((22.36 - latitude) / 0.2) * 100));
  return { left: `${left}%`, top: `${top}%` };
}

export function TrafficHeatmap() {
  const [location, setLocation] = useState<{ left: string; top: string } | null>(null);
  const [status, setStatus] = useState('未啟用 GPS');

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus('瀏覽器不支援 GPS');
      return;
    }
    setStatus('定位中...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(getMapPosition(coords.latitude, coords.longitude));
        setStatus('已顯示你的位置');
      },
      () => setStatus('未能取得位置權限'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  const mappedStops = Array.from(
    new Map(
      demoRoutes
        .flatMap((route) => route.legs.flatMap((leg) => [leg.originStop, leg.destinationStop]))
        .map((stop) => [stop.id, stop]),
    ).values(),
  );

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[22px] bg-[#b8e3ea] p-4">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(25deg,transparent_46%,#8ac6cf_47%,#8ac6cf_49%,transparent_50%),linear-gradient(115deg,transparent_44%,#a4d2d4_45%,#a4d2d4_47%,transparent_48%)] [background-size:160px_120px,220px_160px]" />
      <div className="absolute left-[10%] top-[12%] h-24 w-44 rotate-12 rounded-[45%] bg-[#91d3de]" />
      <div className="absolute right-[5%] top-[45%] h-28 w-48 -rotate-12 rounded-[45%] bg-[#91d3de]" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/40" />
      <div className="absolute left-1/2 top-[30%] h-[150px] w-[3px] -translate-x-1/2 bg-[#176b2c]" />
      <div className="absolute left-[28%] top-[55%] h-[3px] w-[52%] bg-[#2e8b57]" />

      {heatPoints.map((point) => (
        <div
          key={point.label}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[1px] ${
            point.intensity === 'high'
              ? 'h-24 w-24 bg-red-400/45'
              : point.intensity === 'medium'
                ? 'h-20 w-20 bg-amber-300/50'
                : 'h-16 w-16 bg-emerald-300/50'
          }`}
          style={{ left: point.left, top: point.top }}
          title={`${point.label} traffic intensity`}
        />
      ))}

      {mappedStops.slice(0, 4).map((stop, index) => (
        <div
          key={stop.id}
          className={`absolute flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg ${
            index === 0 ? 'bg-red-500' : index === 1 ? 'bg-blue-500' : 'bg-emerald-500'
          }`}
          style={{ left: `${28 + index * 14}%`, top: `${48 - index * 5}%` }}
          title={stop.name}
        >
          {stop.name.slice(0, 1)}
        </div>
      ))}

      {location && (
        <div
          aria-label="Your current GPS position"
          className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.25)]"
          style={location}
        />
      )}

      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          className="rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow hover:bg-white"
          onClick={locateMe}
          type="button"
        >
          ◎ 使用 GPS
        </button>
        <span className="rounded-xl bg-white/90 px-3 py-1.5 text-[10px] text-slate-600 shadow">
          {status}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-400" />
        交通熱點示意 · 尚未接入 live traffic feed
      </div>
    </div>
  );
}
