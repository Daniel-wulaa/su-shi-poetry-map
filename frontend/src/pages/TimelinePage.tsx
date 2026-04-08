// 生平年表页面 - 苏轼完整人生轨迹（增强版）
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Book, Award, Calendar, ChevronRight } from 'lucide-react';
import { useTimeline } from '@/hooks/useApi';

// 苏轼生平大事记数据
const LIFE_EVENTS = [
  { year: 1037, title: '出生', description: '生于眉州眉山（今四川眉山）', type: 'birth', icon: '🌱' },
  { year: 1054, title: '娶妻王氏', description: '娶王弗为妻，夫妻感情深厚', type: 'family', icon: '❤️' },
  { year: 1057, title: '进士及第', description: '与弟苏辙同科及第，名动京师', type: 'achievement', icon: '🏆' },
  { year: 1061, title: '签书凤翔府判官', description: '初入仕途，开始为官生涯', type: 'career', icon: '📜' },
  { year: 1065, title: '凤翔任满', description: '任满回京，判登闻鼓院', type: 'career', icon: '📜' },
  { year: 1066, title: '父丧归乡', description: '父亲苏洵去世，返乡守孝', type: 'family', icon: '🕯️' },
  { year: 1069, title: '通判杭州', description: '因反对新法被外放，通判杭州', type: 'career', icon: '📜' },
  { year: 1071, title: '妻王弗卒', description: '爱妻王弗去世，作《江城子》悼亡', type: 'family', icon: '💔' },
  { year: 1074, title: '知密州', description: '改知密州，作《江城子·密州出猎》', type: 'career', icon: '📜' },
  { year: 1075, title: '悼亡妻', description: '作《江城子·乙卯正月二十日夜记梦》', type: 'work', icon: '✍️' },
  { year: 1076, title: '知徐州', description: '改知徐州，抗洪救灾', type: 'career', icon: '📜' },
  { year: 1079, title: '乌台诗案', description: '因诗获罪，被捕入狱，险遭杀身之祸', type: 'crisis', icon: '⚡' },
  { year: 1080, title: '贬黄州', description: '贬为黄州团练副使，开始创作高峰', type: 'career', icon: '📜' },
  { year: 1082, title: '赤壁之作', description: '作《念奴娇·赤壁怀古》《前后赤壁赋》', type: 'work', icon: '✍️' },
  { year: 1084, title: '移汝州', description: '量移汝州，游庐山作《题西林壁》', type: 'career', icon: '📜' },
  { year: 1085, title: '哲宗即位', description: '高太后听政，起用旧党', type: 'history', icon: '📜' },
  { year: 1086, title: '知登州', description: '任登州知州，五日而召还', type: 'career', icon: '📜' },
  { year: 1087, title: '任翰林学士', description: '任翰林学士，知制诰', type: 'career', icon: '📜' },
  { year: 1089, title: '知杭州', description: '外放知杭州，疏浚西湖筑苏堤', type: 'achievement', icon: '🏆' },
  { year: 1091, title: '召还京师', description: '召为翰林学士承旨', type: 'career', icon: '📜' },
  { year: 1093, title: '妻王闰之卒', description: '续弦王闰之去世', type: 'family', icon: '🕯️' },
  { year: 1094, title: '贬惠州', description: '新党再起，贬知英州，再贬惠州', type: 'crisis', icon: '⚡' },
  { year: 1095, title: '惠州生活', description: '作"日啖荔枝三百颗，不辞长作岭南人"', type: 'work', icon: '✍️' },
  { year: 1097, title: '贬儋州', description: '再贬琼州别驾，昌化军安置', type: 'crisis', icon: '⚡' },
  { year: 1100, title: '遇赦北归', description: '徽宗即位，遇赦北还', type: 'career', icon: '📜' },
  { year: 1101, title: '卒于常州', description: '病逝于常州，享年六十五岁', type: 'death', icon: '🕯️' },
];

const EVENT_TYPE_STYLE: Record<string, string> = {
  birth: 'bg-green-100 text-green-800 border-green-300',
  family: 'bg-pink-100 text-pink-800 border-pink-300',
  achievement: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  career: 'bg-blue-100 text-blue-800 border-blue-300',
  crisis: 'bg-purple-100 text-purple-800 border-purple-300',
  work: 'bg-amber-100 text-amber-800 border-amber-300',
  history: 'bg-slate-100 text-slate-800 border-slate-300',
  death: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function TimelinePage() {
  const navigate = useNavigate();
  const { data: timeline } = useTimeline();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 获取某年的诗词
  const getPoetriesByYear = (year: number) => {
    return timeline?.find(t => t.year === year)?.poetries || [];
  };

  // 点击事件 - 跳转到诗词详情或地图
  const handleEventClick = (year: number, locationIds?: number[]) => {
    if (locationIds && locationIds.length > 0) {
      // 有地点信息，跳转到地图并定位
      const params = new URLSearchParams();
      locationIds.forEach(id => params.append('locations', id.toString()));
      navigate(`/map?${params}`);
    } else {
      // 查看该年份的诗词
      const poetries = getPoetriesByYear(year);
      if (poetries.length > 0) {
        navigate(`/poetry/${poetries[0].id}`);
      } else {
        setSelectedYear(selectedYear === year ? null : year);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">苏轼生平年表</h1>
          <p className="text-blue-100">1037 - 1101 年 · 北宋文学家、书法家、美食家</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{timeline?.length || 0}</div>
              <div className="text-xs text-muted-foreground">有诗可考年份</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Book className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">
                {timeline?.reduce((sum, t) => sum + t.poetries.length, 0) || 0}
              </div>
              <div className="text-xs text-muted-foreground">收录诗词</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{LIFE_EVENTS.length}</div>
              <div className="text-xs text-muted-foreground">人生大事</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">65</div>
              <div className="text-xs text-muted-foreground">享年（岁）</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200" />

          {/* 事件列表 */}
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-6">
              {LIFE_EVENTS.map((event, index) => {
                const yearPoetries = getPoetriesByYear(event.year);
                const isSelected = selectedYear === event.year;

                return (
                  <div
                    key={event.year}
                    className={`relative flex items-start gap-4 transition-all ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* 时间线节点 */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 -ml-2 mt-1.5 rounded-full bg-blue-500 border-4 border-white shadow z-10" />

                    {/* 内容卡片 */}
                    <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <Card className={`hover:shadow-lg transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}>
                        <CardContent className="p-4">
                          <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                            <span className="text-2xl">{event.icon}</span>
                            <Badge className={EVENT_TYPE_STYLE[event.type]}>
                              {event.title}
                            </Badge>
                            <span className="text-sm font-bold text-primary">
                              {event.year}年
                            </span>
                            {yearPoetries.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Book className="w-3 h-3 mr-1" />
                                {yearPoetries.length}首
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>

                          {/* 展开的诗词列表 */}
                          {isSelected && yearPoetries.length > 0 && (
                            <div className={`mt-3 pt-3 border-t space-y-2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                该年作品：
                              </p>
                              {yearPoetries.map((poetry) => (
                                <button
                                  key={poetry.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/poetry/${poetry.id}`);
                                  }}
                                  className="block w-full text-left text-sm p-2 bg-slate-50 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3" />
                                    {poetry.title}
                                    {poetry.genre && (
                                      <span className="text-xs text-muted-foreground">
                                        · {poetry.genre}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* 操作按钮 */}
                          <div className={`mt-3 flex gap-2 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                            {yearPoetries.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedYear(isSelected ? null : event.year);
                                }}
                              >
                                <Book className="w-3 h-3 mr-1" />
                                {isSelected ? '收起' : '查看作品'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleEventClick(event.year)}
                            >
                              详情
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 图例 */}
      <div className="fixed bottom-4 left-4 bg-card/90 backdrop-blur border shadow-lg rounded-lg p-3 z-10">
        <div className="flex flex-wrap gap-2 text-xs max-w-xs">
          <Badge className="bg-green-100 text-green-800">出生</Badge>
          <Badge className="bg-blue-100 text-blue-800">仕途</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">成就</Badge>
          <Badge className="bg-purple-100 text-purple-800">危机</Badge>
          <Badge className="bg-amber-100 text-amber-800">作品</Badge>
          <Badge className="bg-pink-100 text-pink-800">家庭</Badge>
          <Badge className="bg-gray-100 text-gray-800">逝世</Badge>
        </div>
      </div>
    </div>
  );
}
