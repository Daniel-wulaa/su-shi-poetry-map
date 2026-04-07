// 卡片预览组件
import { forwardRef, useRef } from 'react';
import type { Poetry } from '@/types/api';

interface CardPreviewProps {
  poetry: Poetry;
  location?: string;
  variant?: 'classic' | 'ink' | 'minimal';
}

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  ({ poetry, location, variant = 'classic' }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const targetRef = ref || internalRef;

    // 提取诗词中的名句（取前两句或前 30 字）
    const getFamousLine = () => {
      const lines = poetry.content.split('\n').filter(line => line.trim());
      return lines.slice(0, 2).join('，');
    };

    const famousLine = getFamousLine();

    return (
      <div
        ref={targetRef}
        className={`w-[400px] h-[500px] relative overflow-hidden ${
          variant === 'classic' ? 'bg-gradient-to-br from-amber-50 to-orange-100' :
          variant === 'ink' ? 'bg-gradient-to-br from-slate-100 to-slate-200' :
          'bg-gradient-to-br from-white to-slate-50'
        }`}
        style={{
          backgroundImage: variant === 'ink'
            ? 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0 L100 100 M100 0 L0 100" stroke="%23e2e8f0" stroke-width="1" opacity="0.3"/%3E%3C/svg%3E")'
            : undefined
        }}
      >
        {/* 装饰边框 */}
        <div className="absolute inset-4 border-2 border-stone-300/50 rounded-lg" />

        {/* 内容区域 */}
        <div className="absolute inset-6 flex flex-col items-center justify-center">
          {/* 顶部装饰 */}
          <div className="mb-6">
            <svg width="40" height="8" viewBox="0 0 40 8" fill="none">
              <path d="M0 4 Q10 0 20 4 T40 4" stroke="#78716c" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* 诗词标题 */}
          <h1 className="text-3xl font-bold text-stone-800 mb-2 font-serif">
            {poetry.title}
          </h1>

          {/* 作者信息 */}
          <p className="text-sm text-stone-500 mb-6">
            {poetry.dynasty} · {poetry.author}
          </p>

          {/* 诗词名句 */}
          <div className="text-center mb-8 px-4">
            <p
              className="text-lg text-stone-700 font-serif leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {famousLine}
            </p>
          </div>

          {/* 地点信息 */}
          {location && (
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
              <span>📍</span>
              <span>{location}</span>
            </div>
          )}

          {/* 创作年份 */}
          {poetry.year && (
            <p className="text-xs text-stone-400">
              {poetry.year}年 {poetry.year_range && `· ${poetry.year_range}`}
            </p>
          )}
        </div>

        {/* 底部装饰 */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <span>苏轼人生诗词地图</span>
            <span>·</span>
            <span>su-shi-poetry-map.com</span>
          </div>
        </div>

        {/* 角落装饰 */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-stone-300/50" />
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-stone-300/50" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-stone-300/50" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-stone-300/50" />
      </div>
    );
  }
);

CardPreview.displayName = 'CardPreview';
