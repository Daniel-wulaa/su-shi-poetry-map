// API 类型定义
export interface Poetry {
  id: number;
  title: string;
  content: string;
  dynasty: string;
  author: string;
  year: number | null;
  year_range: string | null;
  period: string | null;
  genre: string | null;
  tags: string | null;
  background: string | null;
  annotations: string | null;
  translations: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Location {
  id: number;
  name: string;
  ancient_name: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  province: string | null;
  description: string | null;
  attraction_info: string | null;
  images: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PoetryLocation {
  id: number;
  poetry_id: number;
  location_id: number;
  relation_type: string;
  confidence: string;
  notes: string | null;
}

export interface PoetryListResponse {
  items: Poetry[];
  total: number;
  page: number;
  page_size: number;
}

export interface LocationListResponse {
  items: Location[];
  total: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface SearchResult {
  type: 'poetry' | 'location';
  data: Record<string, unknown>;
}

export interface StatsResponse {
  total_poetries: number;
  total_locations: number;
  total_periods: number;
  poetries_by_period: { period: string; count: number }[];
  locations_by_province: { province: string; count: number }[];
}

export interface TimelineItem {
  year: number;
  poetries: { id: number; title: string; genre: string | null }[];
  period: string | null;
  location_ids?: number[];
}
