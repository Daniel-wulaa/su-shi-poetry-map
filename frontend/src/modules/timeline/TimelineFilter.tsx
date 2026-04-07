// 时间线筛选器组件
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimeline } from '@/hooks/useApi';
import { useState, useMemo } from 'react';

interface TimelineFilterProps {
  onFilterChange?: (startYear: number, endYear: number) => void;
  className?: string;
}

export function TimelineFilter({
  onFilterChange,
  className = '',
}: TimelineFilterProps) {
  const { data: timeline } = useTimeline();
  const [startYear, setStartYear] = useState<number>(1037);
  const [endYear, setEndYear] = useState<number>(1101);

  // 获取年份范围
  const yearRange = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return { min: 1037, max: 1101 };
    }
    const years = timeline.map((t) => t.year);
    return {
      min: Math.min(...years),
      max: Math.max(...years),
    };
  }, [timeline]);

  // 处理滑块变化
  const handleSliderChange = (values: number[]) => {
    const newStart = values[0];
    const newEnd = values[1];
    setStartYear(newStart);
    setEndYear(newEnd);
    onFilterChange?.(newStart, newEnd);
  };

  // 重置筛选
  const handleReset = () => {
    setStartYear(yearRange.min);
    setEndYear(yearRange.max);
    onFilterChange?.(yearRange.min, yearRange.max);
  };

  return (
    <div className={`p-4 bg-card border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">时间筛选</h3>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          重置
        </Button>
      </div>

      {/* 年份输入 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            起始年份
          </label>
          <Input
            type="number"
            value={startYear}
            onChange={(e) => {
              const year = parseInt(e.target.value) || yearRange.min;
              setStartYear(Math.max(yearRange.min, Math.min(year, endYear)));
            }}
            className="w-full"
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            结束年份
          </label>
          <Input
            type="number"
            value={endYear}
            onChange={(e) => {
              const year = parseInt(e.target.value) || yearRange.max;
              setEndYear(Math.max(startYear, Math.min(year, yearRange.max)));
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* 时间滑块 */}
      <div className="px-2">
        <Slider
          value={[startYear, endYear]}
          min={yearRange.min}
          max={yearRange.max}
          step={1}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{yearRange.min}年</span>
          <span>{yearRange.max}年</span>
        </div>
      </div>

      {/* 已选范围 */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">已选择：</span>
        <span className="font-medium">{startYear}年 - {endYear}年</span>
        <span className="text-muted-foreground ml-2">
          （共{endYear - startYear + 1}年）
        </span>
      </div>
    </div>
  );
}
