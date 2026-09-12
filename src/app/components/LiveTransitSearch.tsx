'use client';

import { useMemo, useState } from 'react';

interface TransitRoute {
  route: string;
  bound?: string;
  orig_tc?: string;
  dest_tc?: string;
  orig_en?: string;
  dest_en?: string;
}

export function LiveTransitSearch() {
  const [from, setFrom] = useState('佐敦');
  const [to, setTo] = useState('尖沙咀');
  const [operator, setOperator] = useState<'KMB' | 'CTB'>('KMB');
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [status, setStatus] = useState('輸入地點後按搜尋，讀取官方路線目錄');

  const filteredRoutes = useMemo(() => {
    const originQuery = from.trim().toLowerCase();
    const destinationQuery = to.trim().toLowerCase();
    return routes.filter((route) => {
      const origin = [route.orig_tc, route.orig_en].filter(Boolean).join(' ').toLowerCase();
      const destination = [route.dest_tc, route.dest_en].filter(Boolean).join(' ').toLowerCase();
      const routeNumber = route.route.toLowerCase();
      const originMatches = !originQuery || origin.includes(originQuery) || routeNumber.includes(originQuery);
      const destinationMatches =
        !destinationQuery || destination.includes(destinationQuery) || routeNumber.includes(destinationQuery);
      return originMatches && destinationMatches;
    });
  }, [from, routes, to]);

  async function search() {
    setStatus('正在讀取官方路線資料...');
    try {
      const response = await fetch(`/api/transit?operator=${operator}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as {
        data?: TransitRoute[];
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? '官方交通 API 暫時未能使用');
      }
      setRoutes(payload.data);
      setStatus(`已載入 ${payload.data.length} 條${operator === 'KMB' ? '九巴' : '城巴'}官方路線`);
    } catch (error) {
      setRoutes([]);
      setStatus(error instanceof Error ? error.message : '讀取官方交通 API 失敗');
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-green-100 bg-green-50/70 p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="起點"
          className="min-w-0 rounded-xl border-0 bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
          onChange={(event) => setFrom(event.target.value)}
          placeholder="起點，例如佐敦"
          value={from}
        />
        <input
          aria-label="目的地"
          className="min-w-0 rounded-xl border-0 bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
          onChange={(event) => setTo(event.target.value)}
          placeholder="目的地，例如尖沙咀"
          value={to}
        />
        <select
          aria-label="營辦商"
          className="rounded-xl border-0 bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
          onChange={(event) => setOperator(event.target.value as 'KMB' | 'CTB')}
          value={operator}
        >
          <option value="KMB">九巴官方 API</option>
          <option value="CTB">城巴官方 API</option>
        </select>
        <button
          className="rounded-xl bg-[#176b2c] px-4 py-2 text-sm font-bold text-white hover:bg-[#0f5422]"
          onClick={search}
          type="button"
        >
          搜尋官方路線
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600">{status}</p>
      {routes.length > 0 && (
        <div className="mt-3 max-h-52 space-y-2 overflow-auto">
          {filteredRoutes.slice(0, 20).map((route, index) => (
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm" key={`${route.route}-${route.bound ?? index}`}>
              <strong className="text-[#176b2c]">{route.route}</strong>
              <span className="ml-3 flex-1 truncate text-right text-slate-600">
                {route.orig_tc ?? route.orig_en} → {route.dest_tc ?? route.dest_en}
              </span>
            </div>
          ))}
          {filteredRoutes.length === 0 && (
            <p className="rounded-xl bg-white p-3 text-xs text-slate-500">
              官方目錄沒有符合起點/目的地文字的路線；完整路線已成功載入。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
