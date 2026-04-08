// 诗词标点组件
import { useEffect, useRef } from 'react';
import type { Location } from '@/types/api';

interface PoetryMarkersProps {
  map: any;
  locations: Location[];
  onLocationClick?: (location: Location) => void;
}

export function PoetryMarkers({
  map,
  locations,
  onLocationClick,
}: PoetryMarkersProps) {
  const markersRef = useRef<any[]>([]);
  const onLocationClickRef = useRef(onLocationClick);
  onLocationClickRef.current = onLocationClick;

  useEffect(() => {
    if (!map || !window.AMap) return;

    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      const AMap = window.AMap;
      const mapContainer = document.getElementById('map-container');
      const mapInstance = (mapContainer as any)?.amap || map;

      if (!mapInstance) return;

      const markers: any[] = [];

      for (const location of locations) {
        if (!location.latitude || !location.longitude) continue;

        try {
          const marker = new AMap.Marker({
            position: [location.longitude, location.latitude],
            title: location.ancient_name || location.name,
            offset: new AMap.Pixel(-13, -30),
          });

          marker.on('click', () => {
            const currentMap = (document.getElementById('map-container') as any)?.amap || mapInstance;

            if (currentMap.getAllInfoWindows) {
              const allWindows = currentMap.getAllInfoWindows();
              allWindows.forEach((win: any) => win.close());
            }

            const infoContent = `
              <div style="padding: 8px; max-width: 200px; font-family: sans-serif;">
                <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                  ${location.ancient_name || location.name}
                </h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
                  ${location.name}
                </p>
              </div>
            `;

            const infoWindow = new AMap.InfoWindow({
              content: infoContent,
              offset: new AMap.Pixel(0, -30),
            });

            infoWindow.open(currentMap, marker.getPosition());
            onLocationClickRef.current?.(location);
          });

          mapInstance.add(marker);
          markers.push(marker);
        } catch (err) {
          console.error(`[PoetryMarkers] 添加标记失败 (${location.name}):`, err);
        }
      }

      markersRef.current = markers;
    };

    requestAnimationFrame(run);

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.warn('[PoetryMarkers] 清理标记失败:', e);
        }
      });
      markersRef.current.length = 0;
    };
  }, [map, locations]);

  return null;
}
