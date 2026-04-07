// 地图控制组件
import { Button } from '@/components/ui/button';
import { Crosshair, Layers, MapPin } from 'lucide-react';

interface MapControlsProps {
  onResetView?: () => void;
}

export function MapControls({ onResetView }: MapControlsProps = {}) {
  const handleReset = () => {
    // 重置地图视图到中国中心
    const map = (window as any).AMap?.Map?.instances?.[0];
    if (map) {
      map.setZoom(4);
      map.setCenter([105, 36]);
    }
    onResetView?.();
  };

  const handleLocate = () => {
    // 定位到用户位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const map = (window as any).AMap?.Map?.instances?.[0];
          if (map) {
            map.setCenter([position.coords.longitude, position.coords.latitude]);
            map.setZoom(12);
          }
        },
        () => {
          console.warn('无法获取用户位置');
        }
      );
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-slate-50"
        onClick={handleLocate}
        title="定位到我的位置"
      >
        <Crosshair className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-slate-50"
        onClick={handleReset}
        title="重置视图"
      >
        <MapPin className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-slate-50"
        title="图层切换（开发中）"
      >
        <Layers className="h-4 w-4" />
      </Button>
    </div>
  );
}
