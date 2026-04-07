// 地图页面 - 增强版
import { useState, useRef, useEffect } from 'react';
import { useAllLocations } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, List, X, Navigation } from 'lucide-react';
import type { Location } from '@/types/api';
import { useMap } from '@/hooks/useMap';

export function MapPageEnhanced() {
  const { data: locations, isLoading } = useAllLocations();
  const [showList, setShowList] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, loaded } = useMap({
    containerId: 'map-page-map-container',
    zoom: 3,
    center: [105, 36],
  });

  // 当地点被选中时，平移到该地点
  useEffect(() => {
    if (map && selectedLocation && loaded) {
      map.panTo([selectedLocation.longitude, selectedLocation.latitude]);
      map.setZoom(6);
      console.log('[MapPage] 已平移到:', selectedLocation.name);
    }
  }, [map, selectedLocation, loaded]);

  const handleLocationClick = (location: Location) => {
    console.log('[MapPage] 地点点击:', location.name);
    setSelectedLocation(location);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 地图容器 */}
      <div
        id="map-page-map-container"
        ref={mapContainerRef}
        className="w-full h-full"
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

      {/* 地点列表侧边栏 */}
      <div
        className={`absolute top-4 left-4 bottom-4 w-80 bg-card border shadow-lg rounded-lg transition-transform duration-300 z-20 ${
          showList ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            苏轼足迹
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowList(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                加载中...
              </div>
            ) : (
              locations?.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {location.ancient_name || location.name}
                      </p>
                      {location.ancient_name && (
                        <p className="text-sm text-muted-foreground">
                          {location.name}
                        </p>
                      )}
                    </div>
                    {location.province && (
                      <Badge variant="secondary" className="text-xs">
                        {location.province}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 展开列表按钮 */}
      {!showList && (
        <Button
          className="absolute top-4 left-4 z-20"
          onClick={() => setShowList(true)}
        >
          <List className="h-4 w-4 mr-2" />
          地点列表
        </Button>
      )}

      {/* 地点详情弹窗 */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 w-80 bg-card border shadow-lg rounded-lg z-30 max-h-[400px] overflow-auto">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedLocation.ancient_name || selectedLocation.name}
                </h3>
                {selectedLocation.ancient_name && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.name}
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedLocation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedLocation.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {selectedLocation.description}
              </p>
            )}

            {selectedLocation.attraction_info && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium mb-1">📍 现今景点</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedLocation.attraction_info}
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (map && selectedLocation) {
                    map.panTo([selectedLocation.longitude, selectedLocation.latitude]);
                    map.setZoom(14);
                  }
                }}
              >
                <Navigation className="h-4 w-4 mr-1" />
                定位
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                查看诗词
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64 bg-card/90 backdrop-blur border shadow-lg rounded-lg p-4 z-10">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {locations?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">足迹地点</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {locations?.reduce((acc, loc) => {
                return acc + (loc.city ? 1 : 0);
              }, 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">省份覆盖</p>
          </div>
        </div>
      </div>
    </div>
  );
}
