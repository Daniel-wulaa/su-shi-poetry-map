// 地图控制 Hook - 提供地图平移、缩放等功能
import { useCallback, useRef } from 'react';

export function useMapController(map: any, AMap: any) {
  const infoWindowRef = useRef<any>(null);

  // 平移到指定地点
  const panToLocation = useCallback((location: { latitude: number; longitude: number }, zoom?: number) => {
    if (!map || !location.latitude || !location.longitude) return;

    map.panTo([location.longitude, location.latitude]);
    if (zoom) {
      map.setZoom(zoom);
    }
    console.log('[MapController] 平移到:', location);
  }, [map]);

  // 显示信息窗口
  const showInfoWindow = useCallback((
    position: [number, number],
    content: string
  ) => {
    if (!map || !AMap) return;

    // 关闭现有窗口
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // 创建新窗口
    const infoWindow = new AMap.InfoWindow({
      content,
      offset: new AMap.Pixel(0, -30),
    });

    infoWindow.open(map, position);
    infoWindowRef.current = infoWindow;
  }, [map, AMap]);

  // 关闭信息窗口
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
  }, []);

  return {
    panToLocation,
    showInfoWindow,
    closeInfoWindow,
  };
}
