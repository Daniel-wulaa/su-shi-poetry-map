// 诗词详情组件
import { useParams, useNavigate } from 'react-router-dom';
import { usePoetry } from '@/hooks/useApi';
import { ArrowLeft, Book, Calendar, MapPin, Tag, Share, Sparkles, Brain, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShareModal } from '@/modules/share/ShareModal';

export function PoetryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: poetry, isLoading, error } = usePoetry(id ? parseInt(id) : 0);
  const [showShareModal, setShowShareModal] = useState(false);

  // 解析正文为句子数组 - 按句号/问号/感叹号分割
  const sentences = useMemo(() => {
    if (!poetry?.content) return [];
    // 按句号、问号、感叹号分割，保持标点符号
    const parts = poetry.content.split(/([.。！？!?])/).filter(s => s.trim());
    const result: string[] = [];

    for (let i = 0; i < parts.length; i += 2) {
      let sentence = parts[i].trim();
      // 加上标点符号
      if (i + 1 < parts.length) {
        sentence += parts[i + 1];
      }
      if (sentence) {
        result.push(sentence);
      }
    }

    return result;
  }, [poetry?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">诗词详情加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !poetry) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">加载失败</h2>
          <p className="text-muted-foreground mb-4">无法加载诗词详情</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
            onClick={() => navigate(-1)}
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  // 解析标签
  const tags = poetry.tags ? poetry.tags.split(',').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <button
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* 诗词头部 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              {poetry.title}
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowShareModal(true)}
              className="shrink-0"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span>{poetry.dynasty} · {poetry.author}</span>
            </div>
            {poetry.genre && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                  {poetry.genre}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 诗词正文 - 居中竖排，每句完整显示 */}
        <Card className="bg-gradient-to-b from-white to-slate-50 mb-6">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-4">
              {sentences.map((sentence, idx) => (
                <p
                  key={idx}
                  className="text-lg md:text-xl font-serif text-slate-800 leading-relaxed"
                >
                  {sentence}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 元信息 */}
        {(poetry.year || poetry.period || tags.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {poetry.year && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">创作年份</div>
                  <div className="font-medium">
                    {poetry.year}年 {poetry.year_range && `（${poetry.year_range}）`}
                  </div>
                </div>
              </div>
            )}
            {poetry.period && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">时期</div>
                  <div className="font-medium">{poetry.period}</div>
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <Tag className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 创作背景 */}
        {poetry.background && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              创作背景
            </h3>
            <p className="text-amber-800 leading-relaxed">
              {poetry.background}
            </p>
          </div>
        )}

        {/* 注释 */}
        {poetry.annotations && (
          <div className="bg-slate-50 border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">注释</h3>
            <div
              className="text-muted-foreground space-y-2"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {poetry.annotations}
            </div>
          </div>
        )}

        {/* AI 解读 */}
        {poetry.ai_interpretation && (
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-indigo-900">
                AI 智能解读
              </h3>
              <span className="text-xs text-indigo-600 ml-auto">Powered by AI</span>
            </div>

            {/* 主旨概括 */}
            {poetry.ai_interpretation.summary && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h4 className="font-semibold text-indigo-800">主旨概括</h4>
                </div>
                <p className="text-indigo-700 leading-relaxed bg-white/60 rounded-lg p-3">
                  {poetry.ai_interpretation.summary}
                </p>
              </div>
            )}

            {/* 核心意象 */}
            {poetry.ai_interpretation.key_imagery && poetry.ai_interpretation.key_imagery.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <h4 className="font-semibold text-indigo-800">核心意象</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {poetry.ai_interpretation.key_imagery.map((img: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {img}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 艺术特色与创作背景 */}
            {(poetry.ai_interpretation.artistic_features || poetry.ai_interpretation.historical_context) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {poetry.ai_interpretation.artistic_features && (
                  <div>
                    <h4 className="font-semibold text-indigo-800 text-sm mb-2">艺术特色</h4>
                    <p className="text-indigo-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3">
                      {poetry.ai_interpretation.artistic_features}
                    </p>
                  </div>
                )}
                {poetry.ai_interpretation.historical_context && (
                  <div>
                    <h4 className="font-semibold text-indigo-800 text-sm mb-2">创作背景</h4>
                    <p className="text-indigo-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3">
                      {poetry.ai_interpretation.historical_context}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 现代启示 */}
            {poetry.ai_interpretation.modern_relevance && (
              <div>
                <h4 className="font-semibold text-indigo-800 text-sm mb-2">现代启示</h4>
                <p className="text-indigo-700 text-sm leading-relaxed bg-white/60 rounded-lg p-3">
                  {poetry.ai_interpretation.modern_relevance}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 译文 */}
        {poetry.translations && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-green-700" />
              <h3 className="text-lg font-semibold text-green-900">译文</h3>
            </div>
            <div
              className="text-green-800 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {poetry.translations}
            </div>
          </div>
        )}

        {/* 赏析 */}
        {poetry.annotations && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Book className="w-5 h-5 text-amber-700" />
              <h3 className="text-lg font-semibold text-amber-900">赏析</h3>
            </div>
            <div
              className="text-amber-800 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {poetry.annotations}
            </div>
          </div>
        )}
      </div>

      {/* 分享卡片弹窗 */}
      <ShareModal
        poetry={poetry}
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}
