export const HK_TRANSIT_API = {
  kmb: 'https://data.etabus.gov.hk/v1/transport/kmb',
  citybus: 'https://rt.data.gov.hk/v2/transport/citybus',
} as const;

const REQUEST_TIMEOUT_MS = 5000;

export interface KmbRouteRecord {
  route: string;
  bound: string;
  service_type: string;
  orig_tc: string;
  dest_tc: string;
}

export interface CitybusRouteRecord {
  co: string;
  route: string;
  orig_tc: string;
  dest_tc: string;
}

export interface TransitStopRecord {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: number;
  long: number;
}

export interface KmbEtaRecord {
  route: string;
  dir: string;
  seq: number;
  dest_tc: string;
  eta: string | null;
  rmk_tc: string;
}

export interface CitybusEtaRecord {
  co: string;
  route: string;
  dir: string;
  seq: number;
  dest_tc: string;
  eta: string | null;
  remarks_tc: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'KMB-Monthly-Pass-Mapper/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      throw new Error(`Transit provider returned HTTP ${response.status}.`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getKmbRoutes() {
  const payload = await fetchJson<{ data: KmbRouteRecord[] }>(
    `${HK_TRANSIT_API.kmb}/route/`,
  );
  return payload.data;
}

export async function getCitybusRoutes() {
  const payload = await fetchJson<{ data: CitybusRouteRecord[] }>(
    `${HK_TRANSIT_API.citybus}/route/ctb`,
  );
  return payload.data;
}

export async function getKmbStops() {
  const payload = await fetchJson<{ data: TransitStopRecord[] }>(
    `${HK_TRANSIT_API.kmb}/stop/`,
  );
  return payload.data;
}

export async function getCitybusStops() {
  const payload = await fetchJson<{ data: TransitStopRecord[] }>(
    `${HK_TRANSIT_API.citybus}/stop/ctb`,
  );
  return payload.data;
}

export async function getKmbEta(stopId: string, route: string) {
  const payload = await fetchJson<{ data: KmbEtaRecord[] }>(
    `${HK_TRANSIT_API.kmb}/eta/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}`,
  );
  return payload.data;
}

export async function getCitybusEta(stopId: string, route: string) {
  const payload = await fetchJson<{ data: CitybusEtaRecord[] }>(
    `${HK_TRANSIT_API.citybus}/eta/CTB/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}`,
  );
  return payload.data;
}
