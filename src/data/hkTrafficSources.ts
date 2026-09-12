export type TrafficSourceCategory =
  | 'BUS_ETA'
  | 'RAIL'
  | 'ROAD_TRAFFIC'
  | 'FERRY'
  | 'OPEN_DATA';

export interface HongKongTrafficSource {
  id: string;
  name: string;
  provider: string;
  category: TrafficSourceCategory;
  description: string;
  officialUrl: string;
  apiBaseUrl: string | null;
  status: 'CONNECTED' | 'AVAILABLE' | 'PLANNED';
  attribution: string;
}

/**
 * Public providers used by the planner. Keep this registry explicit so that
 * adding a source also adds its attribution and does not create an open proxy.
 */
export const HONG_KONG_TRAFFIC_SOURCES: readonly HongKongTrafficSource[] = [
  {
    id: 'kmb-eta',
    name: 'KMB ETA',
    provider: 'Kowloon Motor Bus Co. (1933) Limited',
    category: 'BUS_ETA',
    description: 'KMB route and stop ETA data distributed through DATA.GOV.HK.',
    officialUrl: 'https://data.gov.hk/en-data/dataset/hk-kmb-kmbeta',
    apiBaseUrl: 'https://data.etag.com.hk',
    status: 'AVAILABLE',
    attribution: 'Data supplied by KMB via DATA.GOV.HK.',
  },
  {
    id: 'citybus-eta',
    name: 'Citybus ETA',
    provider: 'Citybus Limited',
    category: 'BUS_ETA',
    description: 'Citybus and NWFB ETA data distributed through DATA.GOV.HK.',
    officialUrl: 'https://data.gov.hk/en-data/dataset/hk-ctb-eta',
    apiBaseUrl: 'https://rt.data.gov.hk',
    status: 'AVAILABLE',
    attribution: 'Data supplied by Citybus via DATA.GOV.HK.',
  },
  {
    id: 'mtr-open-data',
    name: 'MTR Open Data',
    provider: 'MTR Corporation Limited',
    category: 'RAIL',
    description: 'MTR open data and service information.',
    officialUrl: 'https://opendata.mtr.com.hk',
    apiBaseUrl: 'https://opendata.mtr.com.hk',
    status: 'PLANNED',
    attribution: 'Data supplied by MTR Corporation Limited.',
  },
  {
    id: 'td-open-data',
    name: 'Transport Department Open Data',
    provider: 'Hong Kong Transport Department',
    category: 'OPEN_DATA',
    description: 'Government transport datasets, including traffic and public transport data.',
    officialUrl: 'https://data.gov.hk/en-data/provider/hk-td',
    apiBaseUrl: 'https://api.data.gov.hk',
    status: 'AVAILABLE',
    attribution: 'Data provided by the Hong Kong Transport Department via DATA.GOV.HK.',
  },
  {
    id: 'td-traffic-news',
    name: 'Traffic information',
    provider: 'Hong Kong Transport Department',
    category: 'ROAD_TRAFFIC',
    description: 'Traffic news, incidents and road condition information where published by TD.',
    officialUrl: 'https://www.td.gov.hk/en/交通運輸/交通新聞/index.html',
    apiBaseUrl: 'https://api.data.gov.hk',
    status: 'AVAILABLE',
    attribution: 'Traffic information provided by the Hong Kong Transport Department.',
  },
  {
    id: 'ferry-open-data',
    name: 'Ferry service data',
    provider: 'Hong Kong Transport Department',
    category: 'FERRY',
    description: 'Ferry route and service information published through government open data.',
    officialUrl: 'https://data.gov.hk/en-data/provider/hk-td',
    apiBaseUrl: 'https://api.data.gov.hk',
    status: 'PLANNED',
    attribution: 'Data provided by the Hong Kong Transport Department via DATA.GOV.HK.',
  },
];

export function getTrafficSourceCatalog() {
  return HONG_KONG_TRAFFIC_SOURCES.map((source) => ({ ...source }));
}
