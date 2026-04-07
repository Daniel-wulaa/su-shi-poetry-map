// 书法作品页面 - 展示苏轼书法名作
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Download, Image } from 'lucide-react';

// 苏轼书法作品数据（从 sudongpo.org 爬取）
const CALLIGRAPHY_WORKS = [
  {
    id: 1,
    title: '黄州寒食诗帖',
    slug: 'hanshitie',
    period: '黄州时期',
    year: 1082,
    description: '《黄州寒食诗帖》是苏轼行书代表作，被誉为"天下第三行书"。此帖为苏轼贬居黄州第三年寒食节所书，纸本，纵 34.2 厘米，横 199.5 厘米，现藏台北故宫博物院。',
    content: '自我来黄州，已过三寒食。年年欲惜春，春去不容惜。今年又苦雨，两月秋萧瑟。卧闻海棠花，泥污燕支雪。暗中偷负去，夜半真有力。何殊病少年，病起头已白。',
    image: 'https://www.sudongpo.org/wp-content/uploads/2019/07/han-shi-tie.jpg',
    tags: ['行书', '黄州', '代表作'],
  },
  {
    id: 2,
    title: '渡海帖',
    slug: 'du-hai-tie',
    period: '北归时期',
    year: 1100,
    description: '《渡海帖》是苏轼晚年书法精品，书于遇赦北归渡海之时。纸本，纵 28.6 厘米，横 40.2 厘米，现藏台北故宫博物院。',
    content: '轼将渡海，宿澄迈。承令子见访，知从者未归。又云，恐已到万安。不尔，得连日会欵。但有风，即济也。',
    image: 'https://www.sudongpo.org/wp-content/uploads/2022/03/du-hai-tie-1.jpg',
    tags: ['行书', '晚年', '渡海'],
  },
  {
    id: 3,
    title: '苏轼书前赤壁赋卷',
    slug: 'sushi-shu-chibifu',
    period: '黄州时期',
    year: 1082,
    description: '《前赤壁赋》是苏轼被贬黄州时所作的赋，也是中国文学史上的名篇。此卷为苏轼亲笔书写，纸本，纵 28.1 厘米，横 149.3 厘米。',
    content: '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章...',
    image: 'https://www.sudongpo.org/wp-content/uploads/2021/06/sssqcbf2.jpg',
    tags: ['行书', '赤壁赋', '名篇'],
  },
  {
    id: 4,
    title: '阳羡帖',
    slug: 'yang-xian-tie',
    period: '常州时期',
    year: 1084,
    description: '《阳羡帖》，纸本，长 27.6 厘米，横 22.7 厘米，行书，68 字，是苏轼致友人信札。署款"轼再拜"。旅顺博物馆 1963 年购藏。',
    content: '轼虽已买田阳羡，然亦未足伏腊。禅师前所言下备邻庄，果如何，托得之面议，试为经度之。景纯家田亦为议过，已面白，得之此不详云也。',
    image: 'https://www.sudongpo.org/wp-content/uploads/2025/01/yang-xian-tie.jpg',
    tags: ['行书', '信札', '阳羡'],
  },
  {
    id: 5,
    title: '李白仙诗卷',
    slug: 'libai-xianshijuan',
    period: '元祐时期',
    year: 1093,
    description: '李白仙诗卷，北宋苏轼卷纸本墨书 34.5×106 厘米。苏轼书李白诗二首，共 20 行，205 字。此卷为苏轼 58 岁时写于砑花笺之上，现藏日本大阪市立美术馆。',
    content: '朝披梦泽云，笠钓青茫茫。寻丝得双鲤，中有三元章。篆字若丹蛇，逸势如飞翔。归来问天老，奥义不可量...',
    image: 'https://www.sudongpo.org/wp-content/uploads/2025/01/libai-xianshijuan.jpg',
    tags: ['行书', '李白诗', '日本藏'],
  },
  {
    id: 6,
    title: '偃松图卷',
    slug: 'yan-song-tu-juan',
    period: '传',
    year: null,
    description: '《偃松图》传为苏轼所绘，现为浙江杭州崇文堂赵全甫私人收藏。此件作品注录于《石渠宝笈初编》，列为"上等寒一"，并深受乾隆皇帝喜爱。',
    content: '此《偃松图》绘一巨松，从倾斜向左的三四块峭拔锋利的巨石间横向盘曲延展，状若游龙。',
    image: 'https://www.sudongpo.org/wp-content/uploads/2025/01/yan-song-tu-scaled.jpg',
    tags: ['绘画', '松石', '乾隆御题'],
  },
  {
    id: 7,
    title: '定惠院寓居月夜偶出诗稿',
    slug: 'ding-hui-yuan-shi-gao',
    period: '黄州时期',
    year: 1080,
    description: '苏轼定惠院寓居月夜偶出诗稿。纸本，行草书，诗稿二则，凡 12 行，255 字。书于 1080 年（元丰三年）。',
    content: '幽人无事不出门，偶逐东风转良夜。参差玉宇飞木末，缭绕香烟来月下。江云有态清自媚，竹露无声浩如泻...',
    image: 'https://www.sudongpo.org/wp-content/uploads/2024/01/ding-hui-yuan-shi-gao.jpg',
    tags: ['行草', '诗稿', '黄州'],
  },
];

export function CalligraphyPage() {
  const [selectedWork, setSelectedWork] = useState<typeof CALLIGRAPHY_WORKS[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">苏轼书法作品</h1>
          <p className="text-amber-100">墨迹流传千古，笔法冠绝一时</p>
        </div>
      </div>

      {/* 作品卡片列表 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALLIGRAPHY_WORKS.map((work) => (
            <Card
              key={work.id}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden"
              onClick={() => setSelectedWork(work)}
            >
              <div className="aspect-[3/2] bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden">
                <Image className="h-16 w-16 text-amber-300" />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{work.period}</Badge>
                  {work.year && (
                    <span className="text-sm text-muted-foreground">{work.year}年</span>
                  )}
                </div>

                <h3 className="font-semibold text-lg">{work.title}</h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {work.description}
                </p>

                <div className="flex gap-2 flex-wrap pt-2">
                  {work.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 作品详情弹窗 */}
      {selectedWork && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWork(null)}
        >
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedWork.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedWork.period}</Badge>
                    {selectedWork.year && (
                      <span className="text-sm text-muted-foreground">{selectedWork.year}年</span>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedWork(null)}
                >
                  ✕
                </Button>
              </div>

              {/* 作品图片占位 */}
              <div className="aspect-[3/1] bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="h-16 w-16 mx-auto mb-2 text-amber-300" />
                  <p>作品图片</p>
                  <p className="text-xs mt-1">{selectedWork.image}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">作品简介</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedWork.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">释文</h3>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line font-serif">
                    {selectedWork.content}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看详情
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  下载高清图
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap pt-4 border-t">
                {selectedWork.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 统计信息 */}
      <div className="fixed bottom-4 right-4 bg-card/90 backdrop-blur border shadow-lg rounded-lg p-4 z-10">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{CALLIGRAPHY_WORKS.length}</p>
          <p className="text-xs text-muted-foreground">书法作品</p>
        </div>
      </div>
    </div>
  );
}
