// 旅程路线绘制组件
import { useEffect, useState } from 'react';
import { JOURNEY_ROUTES } from '@/data/journeyRoutes';

interface JourneyRoutesProps {
  map: any;
  locations: { id: number; name: string; latitude: number; longitude: number }[];
  showAll?: boolean;
  selectedRouteId?: number | null;
}

export function JourneyRoutes({
  map,
  locations,
  showAll = true,
  selectedRouteId,
}: JourneyRoutesProps) {
  const [polylines, setPolylines] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);

  useEffect(() => {
    if (!map) return;

    // 清理旧的路线和标注
    polylines.forEach(line => line.setMap(null));
    labels.forEach(label => label.setMap(null));
    setPolylines([]);
    setLabels([]);

    const newPolylines: any[] = [];
    const newLabels: any[] = [];

    // 确定要显示的路线
    let routesToShow = JOURNEY_ROUTES;
    if (!showAll && selectedRouteId) {
      routesToShow = JOURNEY_ROUTES.filter(r => r.id === selectedRouteId);
    }

    routesToShow.forEach(route => {
      // 将路线的 waypoints 转换为坐标点
      // 使用 waypoint 自带的坐标作为主要数据源，确保路线始终能绘制
      const path: [number, number][] = route.waypoints.map(waypoint => {
        return [waypoint.longitude, waypoint.latitude];
      });

      // 过滤无效坐标
      const validPath = path.filter(p => p[0] && p[1]);

      if (validPath.length < 2) {
        console.warn(`[JourneyRoutes] 路线 "${route.name}" 有效坐标点不足 2 个，跳过绘制`);
        return;
      }

      // 创建折线
      const polyline = new (window as any).AMap.Polyline({
        path: validPath,
        isOutline: true,
        outlineColor: '#ffffff',
        borderWeight: 1,
        strokeColor: route.color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        strokeStyle: 'solid',
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
      });

      polyline.setMap(map);
      newPolylines.push(polyline);

      // 添加路线标注
      if (route.waypoints.length >= 2) {
        const midIndex = Math.floor(route.waypoints.length / 2);
        const midPoint = validPath[midIndex];

        if (midPoint) {
          const label = new (window as any).AMap.Text({
            text: route.name,
            anchor: 'center',
            position: midPoint,
            offset: new (window as any).AMap.Pixel(0, -20),
            style: {
              'background-color': 'rgba(255, 255, 255, 0.9)',
              'border': '1px solid #ddd',
              'border-radius': '4px',
              'padding': '4px 8px',
              'font-size': '11px',
              'color': route.color,
              'font-weight': 'bold',
              'white-space': 'nowrap',
              'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
            },
          });
          label.setMap(map);
          newLabels.push(label);
        }
      }
    });

    setPolylines(newPolylines);
    setLabels(newLabels);

    return () => {
      newPolylines.forEach(line => line.setMap(null));
      newLabels.forEach(label => label.setMap(null));
    };
  }, [map, locations, showAll, selectedRouteId]);

  return null; // 这个组件不渲染任何 DOM，只在地图上绘制
}
