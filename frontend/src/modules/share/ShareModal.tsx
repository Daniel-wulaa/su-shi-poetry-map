// 分享弹窗组件
import { useState, useRef } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardPreview } from './CardPreview';
import { downloadCardImage, copyCardToClipboard } from './cardGenerator';
import type { Poetry } from '@/types/api';

interface ShareModalProps {
  poetry: Poetry;
  location?: string;
  open: boolean;
  onClose: () => void;
}

export function ShareModal({
  poetry,
  location,
  open,
  onClose,
}: ShareModalProps) {
  const [variant, setVariant] = useState<'classic' | 'ink' | 'minimal'>('classic');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      await downloadCardImage(
        cardRef.current,
        `${poetry.title}-分享卡片.png`
      );
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;

    const success = await copyCardToClipboard(cardRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const variants = [
    { id: 'classic' as const, name: '古典', bg: 'from-amber-50 to-orange-100' },
    { id: 'ink' as const, name: '水墨', bg: 'from-slate-100 to-slate-200' },
    { id: 'minimal' as const, name: '简约', bg: 'from-white to-slate-50' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">分享诗词卡片</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 内容 */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* 左侧：卡片预览 */}
          <div className="flex justify-center items-start">
            <div className="scale-75 origin-top">
              <CardPreview
                ref={cardRef}
                poetry={poetry}
                location={location}
                variant={variant}
              />
            </div>
          </div>

          {/* 右侧：控制选项 */}
          <div className="space-y-6">
            {/* 样式选择 */}
            <div>
              <h3 className="text-sm font-medium mb-3">卡片样式</h3>
              <div className="grid grid-cols-3 gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      variant === v.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`h-12 rounded mb-2 bg-gradient-to-br ${v.bg}`} />
                    <span className="text-xs">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div>
              <h3 className="text-sm font-medium mb-3">分享操作</h3>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载卡片
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      复制到剪贴板
                    </>
                  )}
                </Button>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    // 预留分享功能
                    alert('分享功能开发中...');
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享到社交平台
                </Button>
              </div>
            </div>

            {/* 诗词信息 */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{poetry.title}</h4>
              <p className="text-sm text-muted-foreground">
                {poetry.dynasty} · {poetry.author}
              </p>
              {location && (
                <p className="text-xs text-muted-foreground mt-2">
                  📍 {location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
