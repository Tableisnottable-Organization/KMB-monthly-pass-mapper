export function GoogleMapPanel() {
  const embedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ??
    'https://www.google.com/maps?q=Hong+Kong&output=embed';

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[22px] bg-slate-100">
      <iframe
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
        title="Google Maps Hong Kong transit map"
      />
      <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
        Google Maps · 路線及地圖資料由 Google 提供
      </div>
    </div>
  );
}
