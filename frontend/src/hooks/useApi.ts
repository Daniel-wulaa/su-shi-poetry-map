// API Hooks
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Poetry,
  Location,
  PoetryListResponse,
  LocationListResponse,
  StatsResponse,
  TimelineItem,
  SearchResponse,
} from '@/types/api';

// 诗词相关 Hooks
export function usePoetries(
  page = 1,
  pageSize = 20,
  filters?: {
    period?: string;
    genre?: string;
    year_start?: number;
    year_end?: number;
  }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    ...(filters as Record<string, string>),
  });

  return useQuery<PoetryListResponse>({
    queryKey: ['poetries', page, pageSize, filters],
    queryFn: async () => {
      const { data } = await api.get(`/poetries?${params}`);
      return data;
    },
  });
}

export function usePoetry(id: number) {
  return useQuery<Poetry>({
    queryKey: ['poetry', id],
    queryFn: async () => {
      const { data } = await api.get(`/poetries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// 地点相关 Hooks
export function useLocations(province?: string, city?: string) {
  const params = new URLSearchParams();
  if (province) params.append('province', province);
  if (city) params.append('city', city);

  return useQuery<LocationListResponse>({
    queryKey: ['locations', province, city],
    queryFn: async () => {
      const { data } = await api.get(`/locations?${params}`);
      return data;
    },
  });
}

export function useAllLocations() {
  return useQuery<Location[]>({
    queryKey: ['allLocations'],
    queryFn: async () => {
      const { data } = await api.get('/locations/all');
      return data;
    },
  });
}

// 统计相关 Hooks
export function useStats() {
  return useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/stats');
      return data;
    },
  });
}

// 时间线相关 Hooks
export function useTimeline() {
  return useQuery<TimelineItem[]>({
    queryKey: ['timeline'],
    queryFn: async () => {
      const { data } = await api.get('/timeline');
      return data;
    },
  });
}

// 搜索相关 Hooks
export function useSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data } = await api.get('/search', { params: { q: query } });
      return data;
    },
    enabled: query.length > 0,
  });
}

// 获取地点相关诗词
export function useLocationPoetries(locationId: number) {
  return useQuery<Poetry[]>({
    queryKey: ['locationPoetries', locationId],
    queryFn: async () => {
      const { data } = await api.get(`/locations/${locationId}/poetries`);
      return data;
    },
    enabled: !!locationId,
  });
}

// 按年份获取地点（通过诗词关联）
export function useLocationsByYear(year: number | null) {
  return useQuery<Location[]>({
    queryKey: ['locationsByYear', year],
    queryFn: async () => {
      // 先获取该年份的诗词
      const { data: poetryData } = await api.get('/poetries', {
        params: {
          page: 1,
          page_size: 100,
          year_start: year,
          year_end: year,
        },
      });

      // 暂时返回空数组，后续需要后端添加 location_ids 字段
      return [];
    },
    enabled: year !== null && year !== undefined,
  });
}
