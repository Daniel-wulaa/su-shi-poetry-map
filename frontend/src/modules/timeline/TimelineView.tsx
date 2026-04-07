// 时间线视图组件
import { useMemo } from 'react';
import { useTimeline } from '@/hooks/useApi';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TimelineViewProps {
  onYearSelect?: (year: number, locationIds?: number[]) => void;
  selectedYear?: number | null;
  className?: string;
}

export function TimelineView({
  onYearSelect,
  selectedYear,
  className = '',
}: TimelineViewProps) {
  const { data: timeline, isLoading } = useTimeline();

  // 按年份分组的数据
  const yearGroups = useMemo(() => {
    if (!timeline) return [];

    return timeline.map((item) => ({
      year: item.year,
      period: item.period,
      poetryCount: item.poetries.length,
      poetries: item.poetries,
      locationIds: item.location_ids,
    }));
  }, [timeline]);

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-muted-foreground">时间线加载中...</div>
      </div>
    );
  }

  if (!yearGroups.length) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-slate-50">
        <p className="text-muted-foreground">暂无时间线数据</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ScrollArea className="w-full">
        <div className="flex items-center py-4 px-2 min-w-max">
          {yearGroups.map((group, index) => (
            <div key={group.year} className="flex items-center">
              {/* 时间节点 */}
              <div className="flex flex-col items-center mx-4">
                <button
                  onClick={() => onYearSelect?.(group.year, group.locationIds)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedYear === group.year
                      ? 'bg-primary scale-125'
                      : 'bg-slate-400 hover:bg-primary'
                  }`}
                />
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold">
                    {group.year}
                  </p>
                  {group.period && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {group.period}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {group.poetryCount}首
                  </Badge>
                </div>
              </div>

              {/* 连接线 */}
              {index < yearGroups.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 w-16" />
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* 诗词详情展开区域 */}
      {selectedYear && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {selectedYear}年作品
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onYearSelect?.(0)}
            >
              关闭
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {yearGroups
              .find((g) => g.year === selectedYear)
              ?.poetries.map((poetry) => (
                <div
                  key={poetry.id}
                  className="p-3 bg-white rounded border hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <p className="font-medium text-sm">{poetry.title}</p>
                  {poetry.genre && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {poetry.genre}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
