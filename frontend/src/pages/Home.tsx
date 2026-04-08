// 首页
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/useApi';
import { MapPin, BookOpen, Palette } from 'lucide-react';

export function Home() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 水墨背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url(/hero-bg-2.png)' }}
        />
        {/* 渐变叠加 - 保证文字可读性 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/60 to-background/80 dark:from-slate-950/60" />

        {/* 内容 */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            苏轼人生诗词地图
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            跟着苏轼去旅行，读他写过的风景
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/explore">
              <Button size="lg" className="text-lg px-8">
                <MapPin className="mr-2 h-5 w-5" />
                探索地图
              </Button>
            </Link>
            <Link to="/quotes">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <BookOpen className="mr-2 h-5 w-5" />
                浏览诗词
              </Button>
            </Link>
          </div>
        </div>

        {/* 装饰性水墨效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* 视频介绍 + 关于苏轼 - 二屏左右布局 */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-slate-50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧 - 视频播放框 (2/3) */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">穿越千年，无数过往，带你走近苏轼</h2>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border">
                <iframe
                  src="//player.bilibili.com/player.html?isOutside=true&aid=113220773741649&bvid=BV1m6x1eYEks&cid=26061504892&p=1"
                  scrolling="no"
                  border="0"
                  frameBorder="0"
                  framespacing="0"
                  allowFullScreen
                  className="w-full h-full"
                  title="苏轼人生介绍视频"
                  loading="lazy"
                  style={{ border: '0' }}
                />
              </div>
            </div>

            {/* 右侧 - 苏轼介绍 (1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border p-6 h-full">
                {/* 头像 + 基本信息 - 并行居中布局 */}
                <div className="flex justify-center items-start gap-4 mb-6">
                  {/* 头像 */}
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-md bg-slate-100">
                      <img
                        src="/sushi-portrait.jpg"
                        alt="苏轼画像"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* 基本信息 */}
                  <div className="flex-1 pt-2 max-w-[200px]">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">苏轼</h3>
                    <p className="text-muted-foreground text-sm">
                      字子瞻，号东坡居士
                    </p>
                    <p className="text-muted-foreground text-sm">
                      北宋 · 1037-1101
                    </p>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-slate-200 my-4" />

                {/* 详细介绍 */}
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    苏轼，北宋文学家、书画家。眉州眉山（今属四川）人。与父苏洵、弟苏辙合称<span className="font-medium text-foreground">"三苏"</span>。
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    他在文学艺术方面堪称全才，为<span className="font-medium text-foreground">唐宋八大家</span>之一，词开<span className="font-medium text-foreground">豪放派</span>，与辛弃疾并称<span className="font-medium text-foreground">"苏辛"</span>。
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    书法与黄庭坚、米芾、蔡襄并称<span className="font-medium text-foreground">"宋四家"</span>。
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    他一生宦海浮沉，足迹遍布大半个中国，留下了大量脍炙人口的诗词作品。
                  </p>
                </div>

                {/* 关键词标签 */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    文学家
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    书画家
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    豪放派
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    唐宋八大家
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    宋四家
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 统计信息 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">诗词人生</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/quotes">
              <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow cursor-pointer">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold mb-2">
                  {isLoading ? '-' : stats?.total_poetries || 199}
                </div>
                <div className="text-muted-foreground">收录诗词</div>
              </div>
            </Link>
            <Link to="/explore">
              <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow cursor-pointer">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold mb-2">
                  {isLoading ? '-' : stats?.total_locations}
                </div>
                <div className="text-muted-foreground">足迹地点</div>
              </div>
            </Link>
            <Link to="/calligraphy">
              <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow cursor-pointer">
                <Palette className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold mb-2">
                  {isLoading ? '-' : '书法·绘画·美食'}
                </div>
                <div className="text-muted-foreground">其他文化造诣</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 关于苏轼 - 左右两栏布局 */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">关于苏轼</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左栏 - 生平简介 + 基本信息卡片 */}
            <div className="space-y-6">
              {/* 基本信息卡片 - 百度百科风格 */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">姓名</span>
                    <span className="font-medium">苏轼</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">字</span>
                    <span>子瞻、和仲</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">号</span>
                    <span>东坡居士</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">别名</span>
                    <span>苏东坡、苏文忠、苏仙</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">朝代</span>
                    <span>北宋</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">民族</span>
                    <span>汉族</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">出生日期</span>
                    <span>1037 年 1 月 8 日</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">逝世日期</span>
                    <span>1101 年 8 月 24 日</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">出生地</span>
                    <span>眉州眉山（今四川眉山）</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">祖籍</span>
                    <span>河北栾城</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">官职</span>
                    <span>礼部尚书、端明殿学士等</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">谥号</span>
                    <span>文忠</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">父亲</span>
                    <span>苏洵</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">弟弟</span>
                    <span>苏辙</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">代表作</span>
                    <span>《赤壁赋》《念奴娇》《水调歌头》等</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20 shrink-0">作品集</span>
                    <span>《东坡七集》《东坡乐府》</span>
                  </div>
                </div>
              </div>

              {/* 生平简介 */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  生平简介
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <span className="font-semibold text-foreground">苏轼</span>（1037－1101），北宋文学家、书画家。字子瞻，又字和仲，号东坡居士。眉州眉山（今属四川）人。与父苏洵、弟苏辙合称<span className="text-primary font-medium">"三苏"</span>。
                  </p>
                  <p>
                    <span className="font-medium text-foreground">早年成名</span>：嘉祐二年（1057 年）进士及第，主考官欧阳修对其文章大加赞赏，由此名动京师。
                  </p>
                  <p>
                    <span className="font-medium text-foreground">宦海浮沉</span>：历任凤翔签判、杭州通判、密州知州、徐州知州、湖州知州等职。元丰二年（1079 年）因"乌台诗案"入狱，后贬为黄州团练副使。在黄州期间，创作了《念奴娇·赤壁怀古》《前后赤壁赋》等千古名篇。
                  </p>
                  <p>
                    <span className="font-medium text-foreground">再度起用</span>：元祐年间被召回朝，任翰林学士、礼部尚书等职，主持科举考试，提拔了黄庭坚、秦观、晁补之、张耒等文人，史称<span className="text-primary font-medium">"苏门四学士"</span>。
                  </p>
                  <p>
                    <span className="font-medium text-foreground">晚年贬谪</span>：绍圣年间，新党再起，苏轼被贬惠州（今广东惠州），后再贬儋州（今海南儋州）。在岭南期间，他兴修水利、推广教育，深受百姓爱戴。
                  </p>
                  <p>
                    <span className="font-medium text-foreground">病逝常州</span>：建中靖国元年（1101 年），苏轼北归途中病逝于常州，享年六十四岁。宋高宗时追赠太师，谥号"文忠"。
                  </p>
                  <p>
                    他一生宦海浮沉，足迹遍布大半个中国，留下了大量脍炙人口的诗词作品。从眉山出发，他走过开封、凤翔、杭州、密州、徐州、湖州、黄州、汝州、惠州、儋州，最终在常州画上句点。
                  </p>
                </div>
              </div>
            </div>

            {/* 右栏 - 历史评价与成就 */}
            <div className="space-y-6">
              {/* 总体评价 */}
              <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl border border-primary/20 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  总体评价
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  苏轼是中国文化史上罕见的全才型巨人，在诗、词、文、书、画各个领域都达到了时代巅峰。他的词开豪放一派，打破了晚唐五代以来婉约词的垄断；他的散文纵横捭阖，成为宋代古文运动的领军人物；他的书法自成一家，位列"宋四家"之首。更重要的是，他面对人生挫折时展现出的旷达胸襟和乐观态度，成为后世文人精神追求的典范。
                </p>
              </div>

              {/* 历代名人评价 */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  历代评价
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-primary">
                    <p className="text-sm italic text-muted-foreground">
                      "一门父子三词客，千古文章四大家。"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">—— 清·张鹏翮</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm italic text-muted-foreground">
                      "东坡之词旷，稼轩之词豪。"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">—— 王国维《人间词话》</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-amber-500">
                    <p className="text-sm italic text-muted-foreground">
                      "东坡先生非草草，能文能为诗，又能为赋与辞。"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">—— 宋·黄庭坚</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm italic text-muted-foreground">
                      "李白是天才，杜甫是地才，苏轼是通才。"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">—— 林语堂</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-red-500">
                    <p className="text-sm italic text-muted-foreground">
                      "苏轼是千古第一文人，他的文章是天地间的至文。"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">—— 余秋雨</p>
                  </div>
                </div>
              </div>

              {/* 主要成就 */}
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  主要成就
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-primary">2700+</div>
                    <div className="text-xs text-muted-foreground mt-1">现存诗作</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-primary">400+</div>
                    <div className="text-xs text-muted-foreground mt-1">现存词作</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-primary">4800+</div>
                    <div className="text-xs text-muted-foreground mt-1">现存文章</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-primary">唐宋八大家</div>
                    <div className="text-xs text-muted-foreground mt-1">宋代六家之首</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>苏轼人生诗词地图 © 2026 元叔制造</p>
          <p className="text-sm mt-2">
            传承中华文化，让诗词走进生活
          </p>
        </div>
      </footer>
    </div>
  );
}
