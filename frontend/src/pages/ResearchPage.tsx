// 学术研究页面 - 展示苏轼研究学者和资料
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, User, FileText } from 'lucide-react';

// 研究学者数据
const SCHOLARS = [
  {
    id: 1,
    name: '王水照',
    title: '复旦大学教授',
    avatar: '👨‍🏫',
    introduction: '复旦大学中文系教授，博士生导师，中国苏轼研究学会名誉会长。主要从事唐宋文学研究，著有《苏轼论集》《苏轼选集》《苏轼研究史》等。',
    works: ['《苏轼论集》', '《苏轼选集》', '《苏轼研究史》', '《宋代文学通论》'],
    tags: ['苏轼研究', '宋代文学', '唐宋八大家'],
  },
  {
    id: 2,
    name: '朱刚',
    title: '复旦大学教授',
    avatar: '👨‍🏫',
    introduction: '复旦大学中文系教授，主要研究宋代文学。与王水照合著《苏轼诗词文选评》《苏轼评传》等，对苏轼研究有深入贡献。',
    works: ['《苏轼诗词文选评》', '《苏轼评传》', '《唐宋四大家的道论与文学》'],
    tags: ['苏轼研究', '宋代文学', '诗词评注'],
  },
  {
    id: 3,
    name: '曾枣庄',
    title: '四川大学教授',
    avatar: '👨‍🏫',
    introduction: '四川大学古籍整理研究所教授，长期致力于三苏研究。主编《三苏全书》，著有《苏轼评传》《苏辙年谱》等。',
    works: ['《苏轼评传》', '《三苏全书》', '《苏辙年谱》', '《宋代蜀文辑存》'],
    tags: ['三苏研究', '蜀学', '古籍整理'],
  },
  {
    id: 4,
    name: '孔凡礼',
    title: '中国社会科学院研究员',
    avatar: '👨‍🏫',
    introduction: '中国社会科学院文学研究所研究员，专攻宋代文学研究。著有《苏轼年谱》《三苏年谱》等，为苏轼研究的重要基础文献。',
    works: ['《苏轼年谱》', '《三苏年谱》', '《宋诗纪事续补》'],
    tags: ['年谱研究', '宋代文学', '文献整理'],
  },
  {
    id: 5,
    name: '张志烈',
    title: '四川大学教授',
    avatar: '👨‍🏫',
    introduction: '四川大学文学与新闻学院教授，中国苏轼研究学会会长。主要从事苏轼及宋代文学研究，著有《苏轼笔记》《苏轼散文研究》等。',
    works: ['《苏轼笔记》', '《苏轼散文研究》', '《苏轼辞赋研究》'],
    tags: ['苏轼研究', '散文研究', '宋代文学'],
  },
  {
    id: 6,
    name: '刘尚荣',
    title: '中华书局编审',
    avatar: '👨‍🏫',
    introduction: '中华书局编审，中国苏轼研究学会副会长。主要从事苏轼文集整理与研究，校注《苏轼文集》《苏轼诗集》等。',
    works: ['《苏轼文集校注》', '《苏轼诗集校注》', '《苏轼词校注》'],
    tags: ['文献校注', '苏轼研究', '古籍整理'],
  },
];

// 研究著作数据
const RESEARCH_BOOKS = [
  {
    id: 1,
    title: '王状元集百家注分类东坡先生诗',
    author: '王十朋（编）',
    dynasty: '南宋',
    description: '收录黄庭坚至王十朋三兄弟凡九十六家注，是宋代苏诗注释的集大成之作。全书二十五卷，以类编次，收录苏诗两千余首，注家九十六家，保存了大量珍贵的宋代苏诗研究资料。',
    tags: ['诗集注释', '宋代', '百家注'],
    category: '古籍注释',
    detail: '此书成于南宋庆元年间，王十朋汇集北宋至南宋初期苏诗注释成果，包括赵次公、程缜、林子仁等名家注本。采用分类编次法，分天、地、人、事、物等门类，便于查考。每首诗下汇集多家注释，间附己见，是研究苏诗的重要文献。',
  },
  {
    id: 2,
    title: '苏轼年谱',
    author: '孔凡礼',
    dynasty: '现代',
    description: '详尽考证苏轼一生行迹，是研究苏轼生平的重要参考书。全书七十八卷，约两百万字，按年编排，逐年记载苏轼的生平事迹、交游往来、诗文创作等。',
    tags: ['年谱', '生平研究', '考证'],
    category: '年谱研究',
    detail: '本书以丰富的史料为基础，广泛征引正史、方志、笔记、诗文集等各类文献，对苏轼的生平进行了全面系统的考证。每年之下，先列苏轼行迹，次列交游，再列诗文系年，体例严谨，考证精审。',
  },
  {
    id: 3,
    title: '三苏全书',
    author: '曾枣庄（主编）',
    dynasty: '现代',
    description: '收录苏洵、苏轼、苏辙父子三人的全部著作，是研究三苏的完备资料。全书共二十五册，收入三苏诗文、经学、史学、医学等各类著述。',
    tags: ['三苏', '全集', '资料汇编'],
    category: '全集汇编',
    detail: '本书由四川大学古籍整理研究所编纂，以清王文诰《三苏文粹》为底本，参校众本，增收佚文数百篇。每集前有前言，介绍作者生平、思想及文学成就，后有附录，收录相关研究资料。',
  },
  {
    id: 4,
    title: '苏轼论集',
    author: '王水照',
    dynasty: '现代',
    description: '收录王水照教授研究苏轼的重要论文，涵盖苏轼的思想、文学成就等方面。全书分上下两编，上编论苏轼思想，下编论苏轼文学。',
    tags: ['论文', '研究', '文学评论'],
    category: '研究论文',
    detail: '本书收录作者四十余年来研究苏轼的代表性论文，包括《苏轼的人生观和宇宙观》《苏轼豪放词风的形成》《苏轼散文艺术》等名篇。观点新颖，论证严密，是当代苏轼研究的重要成果。',
  },
  {
    id: 5,
    title: '苏轼研究史',
    author: '王水照',
    dynasty: '现代',
    description: '系统梳理苏轼研究的学术史，从宋代至今的苏轼研究脉络。全书分宋代、金元明代、清代、近现代四个时期，每时期又分若干阶段。',
    tags: ['研究史', '学术史', '综述'],
    category: '研究史',
    detail: '本书首次对苏轼研究史进行全面系统的梳理，分阶段论述各时期苏轼研究的特点、成就和不足。重点分析了各时期代表性学者及其著作，揭示了苏轼研究的内在发展规律。',
  },
  {
    id: 6,
    title: '苏轼诗词文选评',
    author: '王水照、朱刚',
    dynasty: '现代',
    description: '精选苏轼诗词文代表作，附详细注释和评析。分诗、词、文三部分，每部分按创作年代编排。',
    tags: ['选评', '诗词文', '注释'],
    category: '选评注释',
    detail: '本书选录苏轼诗一百首、词五十首、文三十篇，每篇均有注释和评析。注释简明准确，评析深入浅出，既适合专业研究者参考，也便于普通读者欣赏。',
  },
  {
    id: 7,
    title: '苏轼评传',
    author: '曾枣庄',
    dynasty: '现代',
    description: '全面评述苏轼一生的思想、文学和政治活动。全书分生平、思想、文学三编，每编又分若干章。',
    tags: ['评传', '传记', '综合研究'],
    category: '传记研究',
    detail: '本书以苏轼生平为经，以思想、文学为纬，全方位展现苏轼的人生历程和精神世界。生平编详细考证苏轼的行迹和交游；思想编论述苏轼的儒释道思想；文学编分析苏轼的诗、词、文创作。',
  },
  {
    id: 8,
    title: '苏轼散文研究',
    author: '张志烈',
    dynasty: '现代',
    description: '专门研究苏轼散文艺术的学术专著。全书分总论和分论两部分，总论论述苏轼散文的总体特征，分论分析各类散文的特点。',
    tags: ['散文', '艺术研究', '文体研究'],
    category: '专题研究',
    detail: '本书首次对苏轼散文进行系统研究，将其散文分为政论、史论、游记、书信、题跋等十类，逐一分析其艺术特色。重点探讨了苏轼散文的"自然"美学观和"以文为诗"的艺术手法。',
  },
  {
    id: 9,
    title: '苏轼词编年校注',
    author: '邹同庆、王宗堂',
    dynasty: '现代',
    description: '对苏轼词进行编年校注的权威著作。全书三册，收录苏轼词三百余首，按创作年代编排。',
    tags: ['词', '编年', '校注'],
    category: '选评注释',
    detail: '本书以元延祐本《东坡乐府》为底本，参校众本，对苏轼词进行全面校勘。每首词均有校记、注释和编年，附录苏轼词论、苏轼词版本叙录等资料。',
  },
  {
    id: 10,
    title: '苏轼全集校注',
    author: '张志烈、马德富、周裕锴',
    dynasty: '现代',
    description: '苏轼诗文的全集校注本。全书二十册，包括诗集、文集、词集、苏轼年谱、苏轼资料汇编等。',
    tags: ['全集', '校注', '资料'],
    category: '全集汇编',
    detail: '本书由四川大学古籍整理研究所主持，历时二十年完成。诗集以清王文诰《苏文忠公诗编注集成》为底本，文集以明茅维《苏文忠公全集》为底本，广泛参校众本，校勘精审，注释详备。',
  },
];

// 研究论文数据
const RESEARCH_PAPERS = [
  {
    id: 1,
    title: '论苏轼的"自然"文艺观',
    author: '王水照',
    journal: '《文学评论》',
    year: 1992,
    summary: '探讨苏轼文艺思想中"自然"概念的内涵及其在创作中的体现。文章认为，"自然"是苏轼文艺思想的核心范畴，既指艺术表现的自然天成，也指创作态度的任真自得。',
    tags: ['文艺观', '自然', '美学思想'],
    detail: '本文从苏轼的创作实践出发，结合其诗文词中的相关论述，系统阐释了"自然"文艺观的三层内涵：一是艺术表现上的"随物赋形"，二是创作态度上的"不能不为"，三是审美境界上的"平淡天真"。这一文艺观对后世产生了深远影响。',
    keyPoints: [
      '"自然"是苏轼文艺思想的核心范畴，贯穿其创作始终',
      '艺术表现：主张"随物赋形"，反对刻意雕琢',
      '创作态度：强调"不能不为"，即有感而发',
      '审美境界：追求"平淡天真"，返璞归真',
    ],
    analysis: '王水照先生此文是研究苏轼文艺观的经典之作。文章的最大贡献在于将散见于苏轼各篇文章中的"自然"论述进行了系统梳理，提炼出三层内涵的理论框架。特别是将"随物赋形"与苏轼的绘画理论相联系，揭示了其文艺思想的贯通性。文中引用《答谢民师书》《文说》等苏轼自述，论证有力。此文的局限在于对"自然"与"功夫"的关系讨论不够充分，实际上苏轼也强调"绚烂之极归于平淡"，并非完全否定技巧。',
    quotes: [
      '苏轼自评其文："如万斛泉源，不择地而出，在平地滔滔汩汩，虽一日千里无难。"',
      '"夫文之为物，有意于为文者，未尝能工也；无意于为文者，乃能工之。"',
    ],
  },
  {
    id: 2,
    title: '苏轼豪放词风的形成',
    author: '朱刚',
    journal: '《复旦学报》',
    year: 1998,
    summary: '分析苏轼豪放词风的形成过程及其对后世的影响。文章指出，苏轼豪放词风形成于密州时期，成熟于黄州时期，其特点是"以诗为词"和"以文为词"。',
    tags: ['豪放词', '词风', '影响研究'],
    detail: '本文通过考察苏轼词的创作历程，将其词风演变分为三个阶段：杭州时期的婉约探索，密州时期的豪放萌芽，黄州时期的豪放成熟。文章认为，苏轼豪放词风的形成，既有个人的天才创造，也有时代文化的深层影响。',
    keyPoints: [
      '杭州时期：尚处于婉约词风的探索阶段',
      '密州时期：《江城子·密州出猎》标志豪放词风萌芽',
      '黄州时期：《念奴娇·赤壁怀古》标志豪放词风成熟',
      '"以诗为词"和"以文为词"是豪放词风的两大特点',
    ],
    analysis: '朱刚教授此文的创新之处在于采用编年方法，细致梳理了苏轼词风演变的轨迹。文章对《江城子·密州出猎》的分析尤为精彩，指出此词"老夫聊发少年狂"一句，打破了词的传统抒情模式，开创了豪放词的新境界。对黄州时期词作的分析，结合了苏轼的人生遭遇，揭示了豪放风格背后的精神支撑。文章最后讨论豪放词风对辛弃疾、陆游等后世词人的影响，视野开阔。',
    quotes: [
      '苏轼《江城子·密州出猎》："老夫聊发少年狂，左牵黄，右擎苍。"',
      '苏轼《念奴娇·赤壁怀古》："大江东去，浪淘尽，千古风流人物。"',
      '"词至东坡，倾荡磊落，如诗如文，如天地奇观。"——刘辰翁',
    ],
  },
  {
    id: 3,
    title: '苏轼与佛学关系考论',
    author: '曾枣庄',
    journal: '《四川大学学报》',
    year: 1995,
    summary: '考证苏轼与佛学的关系，探讨佛学对其思想和创作的影响。苏轼一生与高僧大德交往频繁，佛学思想深刻影响了他的人生观和文学创作。',
    tags: ['佛学', '思想研究', '影响'],
    detail: '本文详细考证了苏轼与佛印、参寥、辩才等高僧的交往，分析了佛学思想对苏轼的影响：一是"万法平等"的思想影响了其包容的文学观；二是"如梦如幻"的观念影响了其超脱的人生态度；三是禅宗话头影响了其诗歌的理趣表达。',
    keyPoints: [
      '苏轼与佛印了元禅师的交往最为著名，留下诸多公案',
      '与参寥子道潜的诗僧友谊，唱和甚多',
      '佛学"空观"影响其超脱的人生态度',
      '禅宗话头融入诗歌创作，增加理趣',
    ],
    analysis: '曾枣庄教授此文在史料考证上下了很大功夫，详细梳理了苏轼与数十位僧人的交往记录。文章对《赤壁赋》中"逝者如斯"一段的分析很有见地，指出其中蕴含的佛学"无常"观念。对苏轼"人生如梦"主题的词作，文章从佛学角度给出了新的解读。不足在于对苏轼批判佛教的一面关注不够，实际上苏轼对佛教也有理性批判，并非全盘接受。',
    quotes: [
      '苏轼《题西林壁》："不识庐山真面目，只缘身在此山中。"（含禅理）',
      '苏轼《和子由渑池怀旧》："人生到处知何似，应似飞鸿踏雪泥。"',
      '佛印评苏轼："学士才高，学富，识远，然于佛法尚未梦见在。"',
    ],
  },
  {
    id: 4,
    title: '苏诗"以文为诗"的特点',
    author: '孔凡礼',
    journal: '《文学遗产》',
    year: 1990,
    summary: '分析苏轼诗歌中"以文为诗"的艺术特色。苏轼诗歌大量运用散文的句法、章法和议论，开创了宋诗的新风貌。',
    tags: ['诗歌', '以文为诗', '艺术特色'],
    detail: '本文从三个方面论述苏诗"以文为诗"的特点：一是句法上的散文化，多用虚词和长句；二是章法上的散文化，结构开阖自如；三是表现手法上的议论化，好发议论，好讲道理。这一特点对宋诗的发展产生了重要影响。',
    keyPoints: [
      '句法散文化：大量使用"之乎者也"等虚词',
      '章法散文化：结构开阖跌宕，如散文般自由',
      '议论化：好发议论，以议论入诗',
      '"以文为诗"是宋诗区别于唐诗的重要特征',
    ],
    analysis: '孔凡礼先生此文是对苏诗艺术特色的经典研究。文章列举了大量诗例，如《百步洪》中"有如兔走鹰隼落，骏马下注千丈坡"等长句，论证了苏诗句法的散文化特点。对《题西林壁》《和子由渑池怀旧》等名篇的分析，揭示了苏轼如何将哲理议论自然融入诗中。文章最后指出，"以文为诗"并非苏轼首创，韩愈已有此倾向，但苏轼将其发挥到了极致。',
    quotes: [
      '苏轼《百步洪》："有如兔走鹰隼落，骏马下注千丈坡。"（散文化长句）',
      '苏轼《题西林壁》："不识庐山真面目，只缘身在此山中。"（议论入诗）',
      '严羽《沧浪诗话》评："以文字为诗，以才学为诗，以议论为诗。"',
    ],
  },
  {
    id: 5,
    title: '苏轼贬谪文学研究',
    author: '张志烈',
    journal: '《苏轼研究》',
    year: 2000,
    summary: '研究苏轼贬谪期间的文学创作，探讨逆境中的艺术成就。黄州、惠州、儋州三个贬谪时期，是苏轼文学创作的高峰期。',
    tags: ['贬谪文学', '黄州', '惠州', '儋州'],
    detail: '本文系统研究了苏轼贬谪文学的特点：一是题材上的拓展，大量描写贬所风物和民生疾苦；二是情感上的深化，由个人不幸升华为对人生、历史的思考；三是艺术上的创新，形成了独特的贬谪文学风格。贬谪文学是苏轼文学成就的重要组成部分。',
    keyPoints: [
      '黄州时期：创作高峰，代表作有《赤壁赋》《念奴娇》等',
      '惠州时期：描写岭南风物，风格趋于平淡',
      '儋州时期：海外奇观，开拓了诗歌题材',
      '贬谪文学体现了苏轼"逆境成才"的精神品质',
    ],
    analysis: '张志烈教授此文对苏轼贬谪文学进行了全面系统的研究。文章将贬谪文学分为三个阶段，每个阶段都有详细的作品分析。黄州时期的《赤壁赋》《念奴娇·赤壁怀古》等作品，体现了苏轼在逆境中的精神超越；惠州时期的《惠州一绝》等作品，展现了他随遇而安的生活态度；儋州时期的作品，则开拓了海外题材。文章认为，贬谪文学是苏轼文学成就的高峰，体现了"诗穷而后工"的文学规律。',
    quotes: [
      '苏轼《定风波》："回首向来萧瑟处，归去，也无风雨也无晴。"',
      '苏轼《惠州一绝》："日啖荔枝三百颗，不辞长作岭南人。"',
      '苏轼《自题金山画像》："问汝平生功业，黄州惠州儋州。"',
    ],
  },
  {
    id: 6,
    title: '苏轼书法艺术研究',
    author: '刘尚荣',
    journal: '《中国书法》',
    year: 1996,
    summary: '探讨苏轼书法艺术的特点及其在书法史上的地位。苏轼书法与黄庭坚、米芾、蔡襄并称"宋四家"，其书风自然天真，富有书卷气。',
    tags: ['书法', '艺术研究', '书法史'],
    detail: '本文从用笔、结构、章法三个方面分析了苏轼书法的艺术特点：用笔丰腴跌宕，结构欹侧多姿，章法自然错落。文章认为，苏轼书法的最大特点是"尚意"，即追求意趣而非形式，这一书学思想对宋代及后世书法产生了深远影响。',
    keyPoints: [
      '用笔特点：丰腴跌宕，善用偃笔',
      '结构特点：欹侧多姿，左低右高',
      '章法特点：自然错落，不求整齐',
      '"尚意"书风：追求意趣，反对刻意',
    ],
    analysis: '刘尚荣编审此文是对苏轼书法艺术的系统研究。文章结合《黄州寒食诗帖》《洞庭春色赋》等代表作，详细分析了苏轼书法的艺术特点。特别是对《黄州寒食诗帖》的分析，指出其用笔随情感变化而起伏，是"尚意"书风的典范。文章还讨论了苏轼的书学思想，特别是"我书意造本无法，点画信手烦推求"的创作理念。文章最后评价苏轼书法在书法史上的地位，认为其开创了宋代"尚意"书风，影响深远。',
    quotes: [
      '苏轼自评书法："我书意造本无法，点画信手烦推求。"',
      '黄庭坚评苏轼书："东坡书如肥而不腻，瘦而不枯。"',
      '苏轼《黄州寒食诗帖》被誉为"天下第三行书"。',
    ],
  },
  {
    id: 7,
    title: '苏轼词的艺术成就',
    author: '叶嘉莹',
    journal: '《唐宋词研究》',
    year: 1985,
    summary: '从美学角度分析苏轼词的艺术成就。苏轼词突破了传统词的题材和风格，开创了豪放词派，对词体发展有重大贡献。',
    tags: ['词', '艺术成就', '豪放派'],
    detail: '本文认为，苏轼词的艺术成就主要体现在三个方面：一是题材的扩大，将词从艳科推向广阔的社会人生；二是意境的开拓，创造了清雄旷远的艺术境界；三是风格的创新，形成了豪放飘逸的独特风格。苏轼词是宋词发展史上的里程碑。',
    keyPoints: [
      '题材扩大：从艳情词拓展到咏史、怀古、说理等',
      '意境开拓：创造清雄旷远的艺术境界',
      '风格创新：豪放飘逸，自成一家',
      '对词体发展的贡献：提高了词的文学地位',
    ],
    analysis: '叶嘉莹教授此文从美学高度审视苏轼词的艺术成就。文章以《水调歌头·明月几时有》《念奴娇·赤壁怀古》等代表作为例，分析了苏轼词的意境美和风格美。文章特别强调苏轼对词体的贡献，指出苏轼"以诗为词"，将词从"艳科"提升为与诗并列的文学体裁。文章还讨论了苏轼词中的"士大夫"气质，认为其词体现了宋代文人的精神风貌。',
    quotes: [
      '苏轼《水调歌头》："人有悲欢离合，月有阴晴圆缺，此事古难全。"',
      '苏轼《念奴娇》："人生如梦，一尊还酹江月。"',
      '王灼《碧鸡漫志》评："东坡先生非心醉于音律者，偶尔作歌，指出向上一路。"',
    ],
  },
  {
    id: 8,
    title: '苏轼的儒释道思想融合',
    author: '张惠民',
    journal: '《中国哲学史》',
    year: 2003,
    summary: '研究苏轼思想中儒释道三家的融合。苏轼以儒家为本位，兼收佛道，形成了独特的思想体系。',
    tags: ['思想', '儒释道', '融合'],
    detail: '本文分析了苏轼思想的三教融合特征：在政治上坚持儒家入世精神，在人生哲学上吸收道家自然观，在心灵安顿上借鉴佛家空观。三教思想在苏轼这里不是简单的拼凑，而是经过创造性转化，形成了有机统一的思想体系。',
    keyPoints: [
      '儒家本位：政治上坚持入世精神，关心民生',
      '道家影响：人生哲学上崇尚自然，追求自由',
      '佛家借鉴：心灵安顿上借鉴空观，超脱得失',
      '三教融合：创造性转化，形成有机统一',
    ],
    analysis: '张惠民教授此文深入探讨了苏轼思想的复杂性。文章指出，苏轼的三教融合不是简单的兼收并蓄，而是经过批判性吸收和创造性转化。在政治层面，苏轼始终坚持儒家的民本思想，关心民生疾苦；在人生哲学层面，他吸收道家的自然观，形成了超脱的人生态度；在心灵安顿层面，他借鉴佛家的空观，以应对人生挫折。文章认为，苏轼的三教融合代表了宋代士大夫思想的典型特征。',
    quotes: [
      '苏轼《赤壁赋》："逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。"',
      '苏轼自评："吾上可陪玉皇大帝，下可陪卑田院乞儿。"',
      '林语堂评苏轼："他是中国文人中最可爱的一位。"',
    ],
  },
  {
    id: 9,
    title: '论苏轼的史论文学',
    author: '莫砺锋',
    journal: '《南京大学学报》',
    year: 1999,
    summary: '研究苏轼史论散文的文学价值和思想特点。苏轼史论以《志林》为代表，见解独到，文采斐然。',
    tags: ['史论', '散文', '文学价值'],
    detail: '本文从文学角度研究了苏轼的史论散文，认为其特点有三：一是观点新颖，敢于翻案；二是论证严密，逻辑清晰；三是文采斐然，形象生动。苏轼史论不仅是史学著作，也是优秀的文学作品。',
    keyPoints: [
      '观点新颖：敢于翻案，发前人所未发',
      '论证严密：逻辑清晰，以理服人',
      '文采斐然：善用比喻，形象生动',
      '史论与文学的结合：既是史学著作，也是文学佳作',
    ],
    analysis: '莫砺锋教授此文聚焦于苏轼的史论散文。文章以《东坡志林》中的史论为主要研究对象，分析了苏轼史论的思想特点和艺术特色。文章特别指出苏轼史论的"翻案"特点，如《范增论》《留侯论》等，都提出了与传统不同的见解。文章还分析了苏轼史论的文学性，指出其善用比喻、排比等修辞手法，使史论文章既有思想深度，又有文学美感。',
    quotes: [
      '苏轼《留侯论》："古之所谓豪杰之士，必有过人之节。"',
      '苏轼《范增论》："增之欲杀沛公，人臣之分也。"',
      '茅坤评："苏文忠公之文，如长江大河，一泻千里。"',
    ],
  },
  {
    id: 10,
    title: '苏轼与宋代士大夫文化',
    author: '内山精也',
    journal: '《中国文学研究》',
    year: 2001,
    summary: '从文化史角度研究苏轼与宋代士大夫文化的关系。苏轼是宋代士大夫文化的典型代表，其思想行为体现了宋代士人的精神特征。',
    tags: ['文化研究', '士大夫', '宋代'],
    detail: '本文从士大夫文化的视角考察苏轼，认为苏轼身上集中体现了宋代士人的几个特征：一是强烈的政治参与意识，二是深厚的文化修养，三是超脱的人生智慧。苏轼的文化人格对后世士人产生了深远影响。',
    keyPoints: [
      '政治参与：强烈的入世精神，关心国事',
      '文化修养：诗文书画无所不精',
      '人生智慧：超脱通达，处变不惊',
      '文化人格：对后世士人影响深远',
    ],
    analysis: '日本学者内山精也此文从文化史视角研究苏轼，提供了新的研究视角。文章将苏轼置于宋代士大夫文化的大背景下，考察其思想行为的文化意义。文章认为，苏轼是宋代士大夫文化的集大成者，其政治参与、文化创作、人生态度都体现了宋代士人的精神风貌。文章还讨论了苏轼文化人格的历史影响，指出后世文人多以苏轼为楷模。',
    quotes: [
      '苏轼《江城子·密州出猎》："会挽雕弓如满月，西北望，射天狼。"（政治抱负）',
      '苏轼《临江仙》："人生如逆旅，我亦是行人。"（人生智慧）',
      '王国维评："三代以下之诗人，无过于屈子、渊明、子美、子瞻者。"',
    ],
  },
];

export function ResearchPage() {
  const [selectedScholar, setSelectedScholar] = useState<typeof SCHOLARS[0] | null>(null);
  const [selectedBook, setSelectedBook] = useState<typeof RESEARCH_BOOKS[0] | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<typeof RESEARCH_PAPERS[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">苏轼学术研究</h1>
          <p className="text-blue-100">千载东坡研究，百家争鸣传承</p>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="scholars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scholars" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              研究学者
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              研究著作
            </TabsTrigger>
            <TabsTrigger value="papers" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              学术论文
            </TabsTrigger>
          </TabsList>

          {/* 研究学者 */}
          <TabsContent value="scholars">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCHOLARS.map((scholar) => (
                <Card
                  key={scholar.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => setSelectedScholar(scholar)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{scholar.avatar}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{scholar.name}</h3>
                        <p className="text-sm text-muted-foreground">{scholar.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {scholar.introduction}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {scholar.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 研究著作 */}
          <TabsContent value="books">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RESEARCH_BOOKS.map((book) => (
                <Card
                  key={book.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
                  onClick={() => setSelectedBook(book)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {book.author} · {book.dynasty}
                        </p>
                      </div>
                      <Badge variant="outline">{book.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {book.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 学术论文 */}
          <TabsContent value="papers">
            <div className="space-y-4">
              {RESEARCH_PAPERS.map((paper) => (
                <Card
                  key={paper.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPaper(paper)}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{paper.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {paper.author} · 《{paper.journal}》{paper.year}年
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {paper.summary}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {paper.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 学者详情弹窗 */}
      {selectedScholar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedScholar(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedScholar.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedScholar.name}</h2>
                    <p className="text-muted-foreground">{selectedScholar.title}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedScholar(null)}>
                  ✕
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">学者简介</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedScholar.introduction}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">主要著作</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedScholar.works.map((work, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded text-sm hover:bg-slate-100 transition-colors">
                      📚 {work}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  💡 {selectedScholar.name}是当代苏轼研究的重要学者，其研究成果对苏轼学界产生了深远影响。
                </p>
              </div>

              <div className="flex gap-2 flex-wrap pt-4 border-t">
                {selectedScholar.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 著作详情弹窗 */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBook(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
                  <p className="text-muted-foreground">
                    {selectedBook.author} · {selectedBook.dynasty}
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedBook(null)}>
                  ✕
                </Button>
              </div>

              <Badge variant="outline" className="w-fit">{selectedBook.category}</Badge>

              <div>
                <h3 className="font-semibold text-lg mb-2">内容简介</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedBook.description}
                </p>
              </div>

              {selectedBook.detail && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">详细介绍</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedBook.detail}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-4 border-t">
                {selectedBook.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 论文详情弹窗 */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPaper(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPaper.title}</h2>
                  <p className="text-muted-foreground">
                    {selectedPaper.author} · 《{selectedPaper.journal}》{selectedPaper.year}年
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedPaper(null)}>
                  ✕
                </Button>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">论文摘要</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedPaper.summary}
                </p>
              </div>

              {selectedPaper.detail && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">详细内容</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedPaper.detail}
                  </p>
                </div>
              )}

              {selectedPaper.keyPoints && selectedPaper.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">核心论点</h3>
                  <ul className="space-y-2">
                    {selectedPaper.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPaper.quotes && selectedPaper.quotes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg text-amber-900">📜 相关名句</h3>
                  {selectedPaper.quotes.map((quote, i) => (
                    <div key={i} className="text-amber-800 italic text-sm leading-relaxed">
                      "{quote}"
                    </div>
                  ))}
                </div>
              )}

              {selectedPaper.analysis && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">📖 深度赏析</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedPaper.analysis}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-4 border-t">
                {selectedPaper.tags.map(tag => (
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
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{SCHOLARS.length}</p>
            <p className="text-xs text-muted-foreground">研究学者</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{RESEARCH_BOOKS.length}</p>
            <p className="text-xs text-muted-foreground">研究著作</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{RESEARCH_PAPERS.length}</p>
            <p className="text-xs text-muted-foreground">学术论文</p>
          </div>
        </div>
      </div>
    </div>
  );
}
