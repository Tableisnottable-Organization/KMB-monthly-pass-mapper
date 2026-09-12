export function GoogleMapPanel() {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Hong+Kong';

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[22px] bg-slate-100">
      {embedUrl ? (
        <iframe
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title="Google Maps Hong Kong transit map"
        />
      ) : (
        <div className="relative h-full overflow-hidden bg-[#dcebdc]">
          <div className="absolute inset-x-[12%] top-[18%] h-8 rotate-12 rounded-full bg-white/80" />
          <div className="absolute inset-x-[6%] top-[48%] h-7 -rotate-6 rounded-full bg-white/80" />
          <div className="absolute left-[44%] top-[5%] h-[95%] w-7 rotate-12 rounded-full bg-white/70" />
          <div className="absolute left-[20%] top-[32%] h-5 w-5 rounded-full bg-[#176b2c] ring-4 ring-white/80" />
          <div className="absolute left-[62%] top-[58%] h-5 w-5 rounded-full bg-orange-500 ring-4 ring-white/80" />
          <div className="absolute left-[48%] top-[42%] h-5 w-5 rounded-full bg-blue-600 ring-4 ring-white/80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl bg-white/95 p-5 text-center shadow">
              <p className="font-bold text-slate-900">Google Maps 尚未配置嵌入金鑰</p>
              <p className="mt-1 text-xs text-slate-500">
                可開啟 Google Maps 查看完整地圖
              </p>
              <a
                className="mt-3 inline-flex rounded-xl bg-[#176b2c] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f5422]"
                href={googleMapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                開啟 Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
        Google Maps · 路線及地圖資料由 Google 提供
      </div>
    </div>
  );
}
