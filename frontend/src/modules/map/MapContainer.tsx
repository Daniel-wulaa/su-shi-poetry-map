// 地图容器组件
import { useRef, useEffect, useState } from 'react';
import { useMap } from '@/hooks/useMap';
import { PoetryMarkers } from './PoetryMarkers';
import { MapControls } from './MapControls';
import { JourneyRoutes } from './JourneyRoutes';
import type { Location } from '@/types/api';

interface MapContainerProps {
  locations: Location[];
  onLocationClick?: (location: Location) => void;
  className?: string;
  // 定位到特定地点
  focusOnLocationIds?: number[] | null;
  // 是否显示旅程路线
  showJourneyRoutes?: boolean;
}

export function MapContainer({
  locations,
  onLocationClick,
  className = '',
  focusOnLocationIds,
  showJourneyRoutes = true,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerReady, setContainerReady] = useState(false);

  const { map, loaded, error } = useMap({
    containerId: 'map-container',
    zoom: 4,
    center: [105, 36], // 中国中心
  });

  // 确保容器存在
  useEffect(() => {
    if (containerRef.current) {
      setContainerReady(true);
    }
  }, []);

  // 当地图加载完成且有需要定位的地点时，平移到该地点
  // 使用 locations prop 直接定位，确保数据一致
  useEffect(() => {
    if (!loaded || !map) return;
    if (!focusOnLocationIds || focusOnLocationIds.length === 0) return;
    if (locations.length === 0) return;

    console.log('[MapContainer] 定位到地点:', focusOnLocationIds, '当前地点数:', locations.length);
    console.log('[MapContainer] 当前地点列表:', locations.map(l => ({ id: l.id, name: l.name })));

    // 找到需要定位的地点 - 直接使用传入的 locations
    const targetLocations = locations.filter(loc =>
      focusOnLocationIds.includes(loc.id)
    );

    console.log('[MapContainer] 找到目标地点:', targetLocations.map(l => l.name));

    if (targetLocations.length > 0) {
      // 计算所有地点的中心点
      const avgLat = targetLocations.reduce((sum, loc) => sum + loc.latitude, 0) / targetLocations.length;
      const avgLng = targetLocations.reduce((sum, loc) => sum + loc.longitude, 0) / targetLocations.length;

      console.log('[MapContainer] 平移到:', [avgLng, avgLat], '地点:', targetLocations[0]?.name);

      // 平移到中心点
      map.panTo([avgLng, avgLat]);

      // 根据地点数量设置缩放级别
      if (targetLocations.length === 1) {
        map.setZoom(10); // 单个地点，放大显示
      } else if (targetLocations.length <= 3) {
        map.setZoom(8); // 少数地点
      } else {
        map.setZoom(6); // 多个地点
      }
    } else {
      console.warn('[MapContainer] 未找到目标地点，locationIds:', focusOnLocationIds, 'locations:', locations.map(l => l.id));
    }
  }, [loaded, map, locations, focusOnLocationIds]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">地图加载失败</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 地图容器 */}
      <div
        id="map-container"
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '100%', minWidth: '100%' }}
      />

      {/* 加载状态 */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">地图加载中...</p>
          </div>
        </div>
      )}

      {/* 诗词标点 */}
      {loaded && map && containerReady && (
        <>
          <PoetryMarkers
            map={map}
            locations={locations}
            onLocationClick={onLocationClick}
          />
          {showJourneyRoutes && (
            <JourneyRoutes
              map={map}
              locations={locations}
              showAll={true}
            />
          )}
        </>
      )}

      {/* 地图控制 */}
      <MapControls />
    </div>
  );
}
