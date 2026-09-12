'use client';

import { useState } from 'react';
import { PlaceAutocomplete, type PlaceResult } from './PlaceAutocomplete';

export function JourneyPlaceSearch() {
  const [origin, setOrigin] = useState('Jordan');
  const [destination, setDestination] = useState('Tsim Sha Tsui');
  const [originPlace, setOriginPlace] = useState<PlaceResult | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceResult | null>(null);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
    setOriginPlace(destinationPlace);
    setDestinationPlace(originPlace);
  }

  return (
    <section className="mb-5 rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-[#176b2c]/15">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#176b2c]">帶我去目的地</p>
          <p className="mt-1 text-sm text-slate-500">輸入任何地標、商場、屋苑或地址，不需要使用已儲存名稱</p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#176b2c]">Hong Kong</span>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <PlaceAutocomplete
          colorClass="bg-[#2e8b57]"
          label="起點"
          onChange={(value) => {
            setOrigin(value);
            setOriginPlace(null);
          }}
          onSelect={setOriginPlace}
          value={origin}
        />
        <button
          aria-label="交換起點及目的地"
          className="flex h-10 w-10 items-center justify-center self-center rounded-full border border-slate-200 bg-white text-xl text-slate-500 transition hover:border-[#2e8b57] hover:text-[#176b2c]"
          onClick={swap}
          type="button"
        >
          ⇅
        </button>
        <PlaceAutocomplete
          colorClass="bg-orange-500"
          label="目的地"
          onChange={(value) => {
            setDestination(value);
            setDestinationPlace(null);
          }}
          onSelect={setDestinationPlace}
          value={destination}
        />
        <a
          className="rounded-2xl bg-[#2e8b57] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[#176b2c]"
          href="#live-search"
        >
          搜尋
        </a>
      </div>
      {(originPlace || destinationPlace) && (
        <p className="mt-3 text-xs text-slate-500">
          已選地點會使用實際座標：{originPlace ? originPlace.name : origin} → {destinationPlace ? destinationPlace.name : destination}
        </p>
      )}
      <div className="mt-4">
        <p className="mb-2 text-xs text-slate-500">下一步可在官方交通資料中配對附近站點和路線。</p>
      </div>
    </section>
  );
}
