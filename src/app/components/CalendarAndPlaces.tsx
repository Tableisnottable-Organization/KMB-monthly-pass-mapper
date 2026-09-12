'use client';

import { useMemo, useState } from 'react';

const savedPlaces = [
  { id: 'home', label: '屋企', address: 'Jordan' },
  { id: 'work', label: '返工', address: 'Central' },
  { id: 'school', label: '學校', address: 'Tsim Sha Tsui' },
];

function toCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function CalendarAndPlaces() {
  const [origin, setOrigin] = useState('Jordan');
  const [destination, setDestination] = useState('Tsim Sha Tsui');
  const [selectedPlace, setSelectedPlace] = useState('work');

  const calendarUrl = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 45);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `香港交通行程：${origin} → ${destination}`,
      dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
      location: destination,
      details: '由 Transit Compass HK 建立的行程提醒。',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [destination, origin]);

  return (
    <div id="places" className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-[#176b2c]/15 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b2c]">
            已儲存地點
          </p>
          <h3 className="mt-1 text-xl font-bold">下一個行程</h3>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#176b2c]">
          繁中（香港）
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {savedPlaces.map((place) => (
          <button
            className={`rounded-2xl p-3 text-left transition ${
              selectedPlace === place.id
                ? 'bg-[#176b2c] text-white'
                : 'bg-green-50 text-slate-800 hover:bg-green-100'
            }`}
            key={place.id}
            onClick={() => {
              setSelectedPlace(place.id);
              setDestination(place.address);
            }}
            type="button"
          >
            <div className="text-sm font-bold">{place.label}</div>
            <div className={`mt-1 truncate text-xs ${
              selectedPlace === place.id ? 'text-green-100' : 'text-slate-500'
            }`}>
              {place.address}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-500">
          起點
          <input
            className="mt-1 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200"
            onChange={(event) => setOrigin(event.target.value)}
            value={origin}
          />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          終點
          <input
            className="mt-1 w-full rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200"
            onChange={(event) => setDestination(event.target.value)}
            value={destination}
          />
        </label>
      </div>

      <a
        className="mt-4 flex items-center justify-center rounded-2xl bg-[#2e8b57] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#176b2c]"
        href={calendarUrl}
        rel="noreferrer"
        target="_blank"
      >
        加入 Google Calendar（明日 08:00）
      </a>
      <p className="mt-2 text-center text-xs text-slate-500">
        會預填起點、終點、地點和下一個工作日行程。
      </p>
    </div>
  );
}
