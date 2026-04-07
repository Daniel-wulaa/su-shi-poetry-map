// 高德地图 Hook
import { useEffect, useRef, useState, useCallback } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

interface UseMapProps {
  containerId?: string;
  zoom?: number;
  center?: [number, number];
}

interface UseMapReturn {
  map: any | null;
  AMap: any | null;
  loaded: boolean;
  error: Error | null;
  addMarker: (position: [number, number], options?: any) => any;
  removeMarker: (marker: any) => void;
  clearMarkers: () => void;
  setCenter: (position: [number, number]) => void;
  setZoom: (zoom: number) => void;
  panTo: (position: [number, number]) => void;
}

// 全局地图实例引用（避免重复初始化）
const globalMapInstance = {
  map: null as any,
  AMap: null as any,
  containerId: null as string | null,
};

export function useMap({
  containerId = 'map-container',
  zoom = 5,
  center = [105, 36],
}: UseMapProps = {}): UseMapReturn {
  const mapRef = useRef<any>(null);
  const AMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initAttemptedRef = useRef(false);

  // 初始化地图 - 只在组件首次挂载时执行
  useEffect(() => {
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    const initMap = async () => {
      try {
        console.log('[Map] 开始初始化地图...');

        // 检查是否已有全局实例
        if (globalMapInstance.map && globalMapInstance.AMap) {
          console.log('[Map] 使用缓存的地图实例');
          mapRef.current = globalMapInstance.map;
          AMapRef.current = globalMapInstance.AMap;
          setLoaded(true);
          return;
        }

        // 配置安全密钥（如果需要）
        const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
        if (securityCode) {
          console.log('[Map] 配置安全密钥');
          window._AMapSecurityConfig = {
            securityJsCode: securityCode,
          };
        }

        const apiKey = import.meta.env.VITE_AMAP_KEY;
        console.log('[Map] API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : '未配置');

        const AMap = await AMapLoader.load({
          key: apiKey || 'your_amap_key',
          version: '2.0',
          plugins: ['AMap.Marker', 'AMap.InfoWindow', 'AMap.ToolBar', 'AMap.Scale'],
        });

        console.log('[Map] 高德地图 SDK 加载成功');
        AMapRef.current = AMap;
        globalMapInstance.AMap = AMap;

        // 创建地图实例
        const map = new AMap.Map(containerId, {
          zoom,
          center,
          mapStyle: 'amap://styles/whitesmoke', // 简洁风格
          viewMode: '2D',
        });

        console.log('[Map] 地图实例创建成功');

        // 添加控件
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());

        mapRef.current = map;
        globalMapInstance.map = map;
        setLoaded(true);

        console.log('[Map] 地图初始化完成');
      } catch (err) {
        console.error('[Map] 地图加载失败:', err);
        setError(err instanceof Error ? err : new Error('地图加载失败'));
      }
    };

    initMap();

    // 清理 - 不销毁地图实例，只清理标记
    return () => {
      markersRef.current = [];
      // 不调用 destroy，保持地图实例
    };
  }, []); // 空依赖数组，只执行一次

  // 当地图配置变化时，更新地图属性（不重新创建实例）
  useEffect(() => {
    if (mapRef.current && loaded) {
      mapRef.current.setZoom(zoom);
      mapRef.current.setCenter(center);
    }
  }, [zoom, center, loaded]);

  // 添加标记
  const addMarker = useCallback((position: [number, number], options?: any) => {
    if (!mapRef.current || !AMapRef.current) return null;

    const marker = new AMapRef.current.Marker({
      position,
      ...options,
    });

    marker.setMap(mapRef.current);
    markersRef.current.push(marker);
    return marker;
  }, []);

  // 移除标记
  const removeMarker = useCallback((marker: any) => {
    if (!mapRef.current) return;

    marker.setMap(null);
    markersRef.current = markersRef.current.filter((m) => m !== marker);
  }, []);

  // 清除所有标记
  const clearMarkers = useCallback(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // 设置中心点
  const setCenter = useCallback((position: [number, number]) => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(position);
  }, []);

  // 设置缩放
  const setZoom = useCallback((zoom: number) => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(zoom);
  }, []);

  // 平移地图
  const panTo = useCallback((position: [number, number]) => {
    if (!mapRef.current) return;
    mapRef.current.panTo(position);
  }, []);

  return {
    map: mapRef.current,
    AMap: AMapRef.current,
    loaded,
    error,
    addMarker,
    removeMarker,
    clearMarkers,
    setCenter,
    setZoom,
    panTo,
  };
}
