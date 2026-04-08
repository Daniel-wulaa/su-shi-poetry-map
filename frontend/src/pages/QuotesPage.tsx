// 名句赏析页面 - 苏轼经典名句
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { usePoetries } from '@/hooks/useApi';

// 时期分类配置 - 用于筛选右侧诗词
const PERIODS = [
  { id: 'all', name: '全部时期' },
  { id: '出生眉山', name: '出生眉山' },
  { id: '进士及第', name: '进士及第' },
  { id: '凤翔签判', name: '凤翔签判' },
  { id: '通判杭州', name: '通判杭州' },
  { id: '知密州', name: '知密州' },
  { id: '黄州团练', name: '黄州团练' },
  { id: '移汝州', name: '移汝州' },
  { id: '知杭州', name: '知杭州' },
  { id: '贬惠州', name: '贬惠州' },
  { id: '贬儋州', name: '贬儋州' },
  { id: '北归时期', name: '北归时期' },
  { id: '未知时期', name: '未知时期' },
];

// 词牌名分类配置 - 用于筛选右侧诗词
const CI_PATTERNS = [
  { id: 'all', name: '全部词牌' },
  { id: '念奴娇', name: '念奴娇' },
  { id: '水调歌头', name: '水调歌头' },
  { id: '江城子', name: '江城子' },
  { id: '定风波', name: '定风波' },
  { id: '卜算子', name: '卜算子' },
  { id: '临江仙', name: '临江仙' },
  { id: '蝶恋花', name: '蝶恋花' },
  { id: '望江南', name: '望江南' },
  { id: '西江月', name: '西江月' },
  { id: '浣溪沙', name: '浣溪沙' },
  { id: '其他', name: '其他诗词' },
];

// 题材分类配置 - 用于筛选右侧诗词
const GENRES = [
  { id: 'all', name: '全部题材' },
  { id: '词', name: '词' },
  { id: '诗', name: '诗' },
  { id: '赋', name: '赋' },
];

// 风格分类配置 - 用于筛选诗词
const STYLES = [
  { id: 'all', name: '全部风格' },
  { id: '豪放', name: '豪放' },
  { id: '婉约', name: '婉约' },
  { id: '哲理', name: '哲理' },
  { id: '思乡', name: '思乡' },
  { id: '悼亡', name: '悼亡' },
  { id: '咏物', name: '咏物' },
  { id: '怀古', name: '怀古' },
  { id: '送别', name: '送别' },
  { id: '田园', name: '田园' },
  { id: '边塞', name: '边塞' },
  { id: '爱情', name: '爱情' },
  { id: '友情', name: '友情' },
  { id: '励志', name: '励志' },
  { id: '讽喻', name: '讽喻' },
];

// 名句数据 - 52 条苏轼经典名句
const FAMOUS_QUOTES = [
  {
    id: 1,
    content: '人生如梦，一尊还酹江月',
    source: '《念奴娇·赤壁怀古》',
    period: '黄州时期',
    year: 1082,
    appreciation: '词人面对赤壁古战场，感叹历史兴亡，人生短暂如梦境，唯有以酒洒地，祭奠江月，表达对古人功业的向往和对人生无常的感慨。',
    tags: ['哲理', '怀古', '人生'],
    fullPoetry: `大江东去，浪淘尽，千古风流人物。
故垒西边，人道是，三国周郎赤壁。
乱石穿空，惊涛拍岸，卷起千堆雪。
江山如画，一时多少豪杰。

遥想公瑾当年，小乔初嫁了，雄姿英发。
羽扇纶巾，谈笑间，樯橹灰飞烟灭。
故国神游，多情应笑我，早生华发。
人生如梦，一尊还酹江月。`,
  },
  {
    id: 2,
    content: '明月几时有？把酒问青天',
    source: '《水调歌头·明月几时有》',
    period: '密州时期',
    year: 1076,
    appreciation: '开篇即以豪迈之姿，举杯问天，表达了对明月的向往和对亲人的思念。词人以天地为友，以明月为伴，展现了旷达超脱的胸襟。',
    tags: ['思亲', '哲理', '中秋'],
    fullPoetry: `明月几时有？把酒问青天。
不知天上宫阙，今夕是何年。
我欲乘风归去，又恐琼楼玉宇，高处不胜寒。
起舞弄清影，何似在人间。

转朱阁，低绮户，照无眠。
不应有恨，何事长向别时圆？
人有悲欢离合，月有阴晴圆缺，此事古难全。
但愿人长久，千里共婵娟。`,
  },
  {
    id: 3,
    content: '但愿人长久，千里共婵娟',
    source: '《水调歌头·明月几时有》',
    period: '密州时期',
    year: 1076,
    appreciation: '表达了对远方亲人的美好祝愿，虽然相隔千里，但能共赏同一轮明月，心灵相通。这是千百年来传诵不衰的思亲名句。',
    tags: ['思亲', '祝愿', '中秋'],
    fullPoetry: `明月几时有？把酒问青天。
不知天上宫阙，今夕是何年。
我欲乘风归去，又恐琼楼玉宇，高处不胜寒。
起舞弄清影，何似在人间。

转朱阁，低绮户，照无眠。
不应有恨，何事长向别时圆？
人有悲欢离合，月有阴晴圆缺，此事古难全。
但愿人长久，千里共婵娟。`,
  },
  {
    id: 4,
    content: '大江东去，浪淘尽，千古风流人物',
    source: '《念奴娇·赤壁怀古》',
    period: '黄州时期',
    year: 1082,
    appreciation: '开篇气势磅礴，以长江东去比喻时光流逝，历史长河中的英雄人物都被浪淘尽，表达了对历史兴亡的深沉感慨。',
    tags: ['怀古', '气势', '历史'],
    fullPoetry: `大江东去，浪淘尽，千古风流人物。
故垒西边，人道是，三国周郎赤壁。
乱石穿空，惊涛拍岸，卷起千堆雪。
江山如画，一时多少豪杰。

遥想公瑾当年，小乔初嫁了，雄姿英发。
羽扇纶巾，谈笑间，樯橹灰飞烟灭。
故国神游，多情应笑我，早生华发。
人生如梦，一尊还酹江月。`,
  },
  {
    id: 5,
    content: '不识庐山真面目，只缘身在此山中',
    source: '《题西林壁》',
    period: '移汝州时期',
    year: 1084,
    appreciation: '以游山的体验，阐明了一个深刻的哲理：人们往往因为身处其中，而不能客观全面地认识事物的真相。',
    tags: ['哲理', '思辨', '山水'],
    fullPoetry: `横看成岭侧成峰，远近高低各不同。
不识庐山真面目，只缘身在此山中。`,
  },
  {
    id: 6,
    content: '欲把西湖比西子，淡妆浓抹总相宜',
    source: '《饮湖上初晴后雨》',
    period: '通判杭州时期',
    year: 1073,
    appreciation: '将西湖比作古代美女西施，无论淡妆还是浓抹，都美丽动人。这是描写西湖的千古名句。',
    tags: ['写景', '西湖', '比喻'],
    fullPoetry: `水光潋滟晴方好，山色空蒙雨亦奇。
欲把西湖比西子，淡妆浓抹总相宜。`,
  },
  {
    id: 7,
    content: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生',
    source: '《定风波·莫听穿林打叶声》',
    period: '黄州时期',
    year: 1082,
    appreciation: '表现了词人面对风雨的旷达态度，即使只有竹杖芒鞋，也胜过骑马，一身蓑衣，任凭风雨，体现了超然物外的人生态度。',
    tags: ['旷达', '人生', '哲理'],
    fullPoetry: `莫听穿林打叶声，何妨吟啸且徐行。
竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。

料峭春风吹酒醒，微冷，山头斜照却相迎。
回首向来萧瑟处，归去，也无风雨也无晴。`,
  },
  {
    id: 8,
    content: '回首向来萧瑟处，归去，也无风雨也无晴',
    source: '《定风波·莫听穿林打叶声》',
    period: '黄州时期',
    year: 1082,
    appreciation: '回首往事，无论是风雨还是晴天，都已不再重要。表达了词人超脱世俗、宠辱不惊的人生态度。',
    tags: ['旷达', '人生', '哲理'],
    fullPoetry: `莫听穿林打叶声，何妨吟啸且徐行。
竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。

料峭春风吹酒醒，微冷，山头斜照却相迎。
回首向来萧瑟处，归去，也无风雨也无晴。`,
  },
  {
    id: 9,
    content: '十年生死两茫茫，不思量，自难忘',
    source: '《江城子·乙卯正月二十日夜记梦》',
    period: '知密州时期',
    year: 1075,
    appreciation: '悼念亡妻之作，十年生死相隔，无需刻意思念，自然难以忘怀。字字血泪，情深意切，是悼亡词中的经典。',
    tags: ['悼亡', '思亲', '爱情'],
    fullPoetry: `十年生死两茫茫，不思量，自难忘。
千里孤坟，无处话凄凉。
纵使相逢应不识，尘满面，鬓如霜。

夜来幽梦忽还乡，小轩窗，正梳妆。
相顾无言，惟有泪千行。
料得年年肠断处，明月夜，短松冈。`,
  },
  {
    id: 10,
    content: '会挽雕弓如满月，西北望，射天狼',
    source: '《江城子·密州出猎》',
    period: '知密州时期',
    year: 1075,
    appreciation: '表达了词人渴望为国效力的豪情壮志，要拉开雕弓如满月，瞄准西北方的天狼星，保卫边疆。',
    tags: ['豪放', '爱国', '壮志'],
    fullPoetry: `老夫聊发少年狂，左牵黄，右擎苍，
锦帽貂裘，千骑卷平冈。
为报倾城随太守，亲射虎，看孙郎。

酒酣胸胆尚开张，鬓微霜，又何妨！
持节云中，何日遣冯唐？
会挽雕弓如满月，西北望，射天狼。`,
  },
  {
    id: 11,
    content: '日啖荔枝三百颗，不辞长作岭南人',
    source: '《惠州一绝》',
    period: '贬惠州时期',
    year: 1095,
    appreciation: '虽然被贬岭南，但词人却能从当地美食中找到乐趣，表现了乐观豁达的生活态度。',
    tags: ['生活', '乐观', '美食'],
    fullPoetry: `罗浮山下四时春，卢橘杨梅次第新。
日啖荔枝三百颗，不辞长作岭南人。`,
  },
  {
    id: 12,
    content: '问汝平生功业，黄州惠州儋州',
    source: '《自题金山画像》',
    period: '北归时期',
    year: 1100,
    appreciation: '晚年自评，将自己被贬的三个地方视为平生功业所在，体现了词人对逆境的超越和对人生价值的独特理解。',
    tags: ['自评', '人生', '哲理'],
    fullPoetry: `心似已灰之木，身如不系之舟。
问汝平生功业，黄州惠州儋州。`,
  },
  {
    id: 13,
    content: '小舟从此逝，江海寄余生',
    source: '《临江仙·夜归临皋》',
    period: '黄州时期',
    year: 1082,
    appreciation: '表达了词人渴望摆脱世俗束缚，乘舟远去，在江海中度过余生的愿望，体现了对自由生活的向往。',
    tags: ['旷达', '自由', '人生'],
    fullPoetry: `夜饮东坡醒复醉，归来仿佛三更。
家童鼻息已雷鸣。
敲门都不应，倚杖听江声。

长恨此身非我有，何时忘却营营？
夜阑风静縠纹平。
小舟从此逝，江海寄余生。`,
  },
  {
    id: 14,
    content: '惊起却回头，有恨无人省',
    source: '《卜算子·黄州定慧院寓居作》',
    period: '黄州时期',
    year: 1080,
    appreciation: '以孤鸿自比，被惊起后回头张望，心中有恨却无人理解。表达了词人贬谪黄州后的孤独和寂寞。',
    tags: ['孤独', '自喻', '黄州'],
    fullPoetry: `缺月挂疏桐，漏断人初静。
谁见幽人独往来，缥缈孤鸿影。

惊起却回头，有恨无人省。
拣尽寒枝不肯栖，寂寞沙洲冷。`,
  },
  {
    id: 15,
    content: '拣尽寒枝不肯栖，寂寞沙洲冷',
    source: '《卜算子·黄州定慧院寓居作》',
    period: '黄州时期',
    year: 1080,
    appreciation: '孤鸿挑遍了寒枝也不肯栖息，宁愿落在寂寞寒冷的沙洲上。表现了词人高洁自守、不同流合污的品格。',
    tags: ['高洁', '自喻', '品格'],
    fullPoetry: `缺月挂疏桐，漏断人初静。
谁见幽人独往来，缥缈孤鸿影。

惊起却回头，有恨无人省。
拣尽寒枝不肯栖，寂寞沙洲冷。`,
  },
  {
    id: 16,
    content: '料得年年肠断处，明月夜，短松冈',
    source: '《江城子·乙卯正月二十日夜记梦》',
    period: '知密州时期',
    year: 1075,
    appreciation: '想象亡妻每年最思念自己的地方，就是那明月照耀下的短松冈上。情深意切，令人动容。',
    tags: ['悼亡', '思亲', '深情'],
    fullPoetry: `十年生死两茫茫，不思量，自难忘。
千里孤坟，无处话凄凉。
纵使相逢应不识，尘满面，鬓如霜。

夜来幽梦忽还乡，小轩窗，正梳妆。
相顾无言，惟有泪千行。
料得年年肠断处，明月夜，短松冈。`,
  },
  {
    id: 17,
    content: '枝上柳绵吹又少，天涯何处无芳草',
    source: '《蝶恋花·春景》',
    period: '通判杭州时期',
    year: 1071,
    appreciation: '枝头柳絮被风吹得越来越少，但天下何处没有芳草呢？既有惜春之情，又含豁达之意。',
    tags: ['惜春', '哲理', '豁达'],
    fullPoetry: `花褪残红青杏小。燕子飞时，绿水人家绕。
枝上柳绵吹又少，天涯何处无芳草。

墙里秋千墙外道。墙外行人，墙里佳人笑。
笑渐不闻声渐悄，多情却被无情恼。`,
  },
  {
    id: 18,
    content: '笑渐不闻声渐悄，多情却被无情恼',
    source: '《蝶恋花·春景》',
    period: '通判杭州时期',
    year: 1071,
    appreciation: '佳人的笑声渐渐消失，墙外的行人却因多情而被无情所恼。写尽了单相思的苦恼。',
    tags: ['爱情', '相思', '哲理'],
    fullPoetry: `花褪残红青杏小。燕子飞时，绿水人家绕。
枝上柳绵吹又少，天涯何处无芳草。

墙里秋千墙外道。墙外行人，墙里佳人笑。
笑渐不闻声渐悄，多情却被无情恼。`,
  },
  {
    id: 19,
    content: '且将新火试新茶，诗酒趁年华',
    source: '《望江南·超然台作》',
    period: '知密州时期',
    year: 1076,
    appreciation: '姑且生起新火烹煮新茶，趁着美好年华饮酒赋诗。表现了词人及时行乐、超然物外的生活态度。',
    tags: ['生活', '超然', '享受'],
    fullPoetry: `春未老，风细柳斜斜。
试上超然台上望，半壕春水一城花。烟雨暗千家。

寒食后，酒醒却咨嗟。
休对故人思故国，且将新火试新茶。诗酒趁年华。`,
  },
  {
    id: 20,
    content: '休对故人思故国，且将新火试新茶',
    source: '《望江南·超然台作》',
    period: '知密州时期',
    year: 1076,
    appreciation: '不要在老朋友面前思念故乡了，还是煮新茶、饮美酒吧。表达了词人的超然和豁达。',
    tags: ['思乡', '超然', '豁达'],
    fullPoetry: `春未老，风细柳斜斜。
试上超然台上望，半壕春水一城花。烟雨暗千家。

寒食后，酒醒却咨嗟。
休对故人思故国，且将新火试新茶。诗酒趁年华。`,
  },
  {
    id: 21,
    content: '人似秋鸿来有信，事如春梦了无痕',
    source: '《正月二十日与潘郭二生出郊寻春》',
    period: '黄州时期',
    year: 1082,
    appreciation: '人像秋天的鸿雁一样按时归来，往事却如春梦一般消逝无痕。表达了对人生无常的感慨。',
    tags: ['人生', '比喻', '哲理'],
    fullPoetry: `东风未肯入东门，走马还寻去岁村。
人似秋鸿来有信，事如春梦了无痕。
江城白酒三杯酽，野老苍颜一笑温。
已约年年为此会，故人不用赋招魂。`,
  },
  {
    id: 22,
    content: '东风未肯入东门，走马还寻去岁村',
    source: '《正月二十日与潘郭二生出郊寻春》',
    period: '黄州时期',
    year: 1082,
    appreciation: '春风不肯吹入东门，只好骑马去寻访去年的村庄。写出了词人寻春的兴致和对往事的怀念。',
    tags: ['寻春', '怀旧', '生活'],
    fullPoetry: `东风未肯入东门，走马还寻去岁村。
人似秋鸿来有信，事如春梦了无痕。
江城白酒三杯酽，野老苍颜一笑温。
已约年年为此会，故人不用赋招魂。`,
  },
  {
    id: 23,
    content: '长江绕郭知鱼美，好竹连山觉笋香',
    source: '《初到黄州》',
    period: '黄州时期',
    year: 1080,
    appreciation: '看见长江环绕城郭就知道这里的鱼儿鲜美，见到翠竹连绵便觉得竹笋清香。写出了黄州的美好。',
    tags: ['写景', '美食', '黄州'],
    fullPoetry: `自笑平生为口忙，老来事业转荒唐。
长江绕郭知鱼美，好竹连山觉笋香。
逐客不妨员外置，诗人例作水曹郎。
只惭无补丝毫事，尚费官家压酒囊。`,
  },
  {
    id: 24,
    content: '逐客不妨员外置，诗人例作水曹郎',
    source: '《初到黄州》',
    period: '黄州时期',
    year: 1080,
    appreciation: '被贬谪的人不妨被安置为员外官，诗人照例做水曹郎这样的闲职。自嘲中带着旷达。',
    tags: ['自嘲', '旷达', '贬谪'],
    fullPoetry: `自笑平生为口忙，老来事业转荒唐。
长江绕郭知鱼美，好竹连山觉笋香。
逐客不妨员外置，诗人例作水曹郎。
只惭无补丝毫事，尚费官家压酒囊。`,
  },
  {
    id: 25,
    content: '只惭无补丝毫事，尚费官家压酒囊',
    source: '《初到黄州》',
    period: '黄州时期',
    year: 1080,
    appreciation: '只惭愧自己对政事毫无补益，还要花费官府给我发俸禄。表达了词人的自省和惭愧。',
    tags: ['自省', '惭愧', '贬谪'],
    fullPoetry: `自笑平生为口忙，老来事业转荒唐。
长江绕郭知鱼美，好竹连山觉笋香。
逐客不妨员外置，诗人例作水曹郎。
只惭无补丝毫事，尚费官家压酒囊。`,
  },
  {
    id: 26,
    content: '云散月明谁点缀，天容海色本澄清',
    source: '《六月二十日夜渡海》',
    period: '北归时期',
    year: 1100,
    appreciation: '云散月明不需要任何点缀，天空和大海本来就是澄清的。比喻自己的清白和坦荡。',
    tags: ['清白', '坦荡', '北归'],
    fullPoetry: `参横斗转欲三更，苦雨终风也解晴。
云散月明谁点缀？天容海色本澄清。
空余鲁叟乘桴意，粗识轩辕奏乐声。
九死南荒吾不恨，兹游奇绝冠平生。`,
  },
  {
    id: 27,
    content: '九死南荒吾不恨，兹游奇绝冠平生',
    source: '《六月二十日夜渡海》',
    period: '北归时期',
    year: 1100,
    appreciation: '在南荒之地九死一生也不悔恨，这次游历的奇特绝险是平生之冠。表现了词人的豪迈和乐观。',
    tags: ['豪迈', '乐观', '北归'],
    fullPoetry: `参横斗转欲三更，苦雨终风也解晴。
云散月明谁点缀？天容海色本澄清。
空余鲁叟乘桴意，粗识轩辕奏乐声。
九死南荒吾不恨，兹游奇绝冠平生。`,
  },
  {
    id: 28,
    content: '荷尽已无擎雨盖，菊残犹有傲霜枝',
    source: '《赠刘景文》',
    period: '知杭州时期',
    year: 1090,
    appreciation: '荷花凋谢已没有擎雨的叶子，菊花虽残但枝条仍然傲霜挺立。赞扬了菊花的坚贞品格。',
    tags: ['咏物', '品格', '励志'],
    fullPoetry: `荷尽已无擎雨盖，菊残犹有傲霜枝。
一年好景君须记，最是橙黄橘绿时。`,
  },
  {
    id: 29,
    content: '一年好景君须记，最是橙黄橘绿时',
    source: '《赠刘景文》',
    period: '知杭州时期',
    year: 1090,
    appreciation: '一年中最好的景色你要记住，就是这橙子金黄、橘子翠绿的时节。鼓励友人珍惜当下。',
    tags: ['励志', '珍惜', '友情'],
    fullPoetry: `荷尽已无擎雨盖，菊残犹有傲霜枝。
一年好景君须记，最是橙黄橘绿时。`,
  },
  {
    id: 30,
    content: '此心安处是吾乡',
    source: '《定风波·南海归赠王定国侍人寓娘》',
    period: '元祐时期',
    year: 1086,
    appreciation: '问寓娘岭南应该不好吧，她却说：心能安定的地方就是我的故乡。表达了随遇而安的人生态度。',
    tags: ['哲理', '人生态度', '豁达'],
    fullPoetry: `常羡人间琢玉郎，天应乞与点酥娘。
自作清歌传皓齿，风起，雪飞炎海变清凉。

万里归来颜愈少，微笑，笑时犹带岭梅香。
试问岭南应不好，却道：此心安处是吾乡。`,
  },
  {
    id: 31,
    content: '万里归来颜愈少，微笑，笑时犹带岭梅香',
    source: '《定风波·南海归赠王定国侍人寓娘》',
    period: '元祐时期',
    year: 1086,
    appreciation: '从万里之外归来容颜更加年轻，微笑时还带着岭南梅花的香气。赞美了寓娘的坚贞和美丽。',
    tags: ['赞美', '坚贞', '友情'],
    fullPoetry: `常羡人间琢玉郎，天应乞与点酥娘。
自作清歌传皓齿，风起，雪飞炎海变清凉。

万里归来颜愈少，微笑，笑时犹带岭梅香。
试问岭南应不好，却道：此心安处是吾乡。`,
  },
  {
    id: 32,
    content: '世事一场大梦，人生几度秋凉',
    source: '《西江月·世事一场大梦》',
    period: '黄州时期',
    year: 1080,
    appreciation: '世间万事就像一场大梦，人生能经历几个秋凉？表达了对人生短暂、世事无常的感慨。',
    tags: ['哲理', '人生', '感慨'],
    fullPoetry: `世事一场大梦，人生几度秋凉？
夜来风叶已鸣廊，看取眉头鬓上。

酒贱常愁客少，月明多被云妨。
中秋谁与共孤光，把盏凄然北望。`,
  },
  {
    id: 33,
    content: '中秋谁与共孤光，把盏凄然北望',
    source: '《西江月·世事一场大梦》',
    period: '黄州时期',
    year: 1080,
    appreciation: '中秋节谁与我共赏这孤独的月光？只能端着酒杯凄然地遥望北方。表达了对亲友的思念。',
    tags: ['中秋', '思念', '孤独'],
    fullPoetry: `世事一场大梦，人生几度秋凉？
夜来风叶已鸣廊，看取眉头鬓上。

酒贱常愁客少，月明多被云妨。
中秋谁与共孤光，把盏凄然北望。`,
  },
  {
    id: 34,
    content: '莫嫌荦确坡头路，自爱铿然曳杖声',
    source: '《东坡》',
    period: '黄州时期',
    year: 1082,
    appreciation: '不要嫌弃这坎坷不平的山坡路，我喜爱手杖拖地发出的清脆声音。表现了词人的乐观和豁达。',
    tags: ['乐观', '豁达', '黄州'],
    fullPoetry: `雨洗东坡月色清，市人行尽野人行。
莫嫌荦确坡头路，自爱铿然曳杖声。`,
  },
  {
    id: 35,
    content: '我本海南民，寄生西蜀州',
    source: '《别海南黎民表》',
    period: '北归时期',
    year: 1100,
    appreciation: '我本来就是海南的人民，只是寄居在西蜀。表达了词人对海南的深厚感情。',
    tags: ['海南', '感情', '北归'],
    fullPoetry: `我本海南民，寄生西蜀州。
忽然变蛮语，感慨成吴讴。
念我此山中，老松三丈修。
别去三载余，归来应白头。`,
  },
  {
    id: 36,
    content: '垂天雌霓云端下，快意雄风海上来',
    source: '《儋耳》',
    period: '贬儋州时期',
    year: 1097,
    appreciation: '彩虹从云端垂下，凉爽的海风从海上吹来。描绘了海南的壮美景色。',
    tags: ['写景', '海南', '壮美'],
    fullPoetry: `霹雳收威暮雨开，独凭栏槛倚崔嵬。
垂天雌霓云端下，快意雄风海上来。
野老已歌丰岁语，除书欲放逐臣回。
残年饱饭东坡老，一壑能专万事灰。`,
  },
  {
    id: 37,
    content: '春宵一刻值千金，花有清香月有阴',
    source: '《春宵》',
    period: '通判杭州时期',
    year: 1072,
    appreciation: '春天的夜晚，一刻钟就价值千金，花儿散发着清香，月光下有着树影。劝人珍惜美好时光。',
    tags: ['珍惜', '时光', '哲理'],
    fullPoetry: `春宵一刻值千金，花有清香月有阴。
歌管楼台声细细，秋千院落夜沉沉。`,
  },
  {
    id: 38,
    content: '纸上得来终觉浅，绝知此事要躬行',
    source: '《冬夜读书示子聿》',
    period: '通判杭州时期',
    year: 1072,
    appreciation: '从书本上得来的知识终究是浅薄的，要真正理解事物的本质，必须亲自实践。',
    tags: ['实践', '学习', '哲理'],
    fullPoetry: `古人学问无遗力，少壮工夫老始成。
纸上得来终觉浅，绝知此事要躬行。`,
  },
  {
    id: 39,
    content: '老夫聊发少年狂',
    source: '《江城子·密州出猎》',
    period: '知密州时期',
    year: 1075,
    appreciation: '我姑且发一发少年的狂放之气。开篇即展现了词人豪迈不羁的个性。',
    tags: ['豪放', '狂放', '壮志'],
    fullPoetry: `老夫聊发少年狂，左牵黄，右擎苍，
锦帽貂裘，千骑卷平冈。
为报倾城随太守，亲射虎，看孙郎。

酒酣胸胆尚开张，鬓微霜，又何妨！
持节云中，何日遣冯唐？
会挽雕弓如满月，西北望，射天狼。`,
  },
  {
    id: 40,
    content: '相顾无言，惟有泪千行',
    source: '《江城子·乙卯正月二十日夜记梦》',
    period: '知密州时期',
    year: 1075,
    appreciation: '与亡妻相见，千言万语却不知从何说起，只有泪水千行。写出了最深的悲痛。',
    tags: ['悼亡', '深情', '悲痛'],
    fullPoetry: `十年生死两茫茫，不思量，自难忘。
千里孤坟，无处话凄凉。
纵使相逢应不识，尘满面，鬓如霜。

夜来幽梦忽还乡，小轩窗，正梳妆。
相顾无言，惟有泪千行。
料得年年肠断处，明月夜，短松冈。`,
  },
  {
    id: 41,
    content: '长恨此身非我有，何时忘却营营',
    source: '《临江仙·夜归临皋》',
    period: '黄州时期',
    year: 1082,
    appreciation: '常常遗憾这身体不属于自己，什么时候能忘却功名利禄？表达了对自由的渴望。',
    tags: ['自由', '人生', '哲理'],
    fullPoetry: `夜饮东坡醒复醉，归来仿佛三更。
家童鼻息已雷鸣。
敲门都不应，倚杖听江声。

长恨此身非我有，何时忘却营营？
夜阑风静縠纹平。
小舟从此逝，江海寄余生。`,
  },
  {
    id: 42,
    content: '夜阑风静縠纹平',
    source: '《临江仙·夜归临皋》',
    period: '黄州时期',
    year: 1082,
    appreciation: '夜深风静，江面如镜。象征着词人内心的平静和对自由的向往。',
    tags: ['写景', '平静', '自由'],
    fullPoetry: `夜饮东坡醒复醉，归来仿佛三更。
家童鼻息已雷鸣。
敲门都不应，倚杖听江声。

长恨此身非我有，何时忘却营营？
夜阑风静縠纹平。
小舟从此逝，江海寄余生。`,
  },
  {
    id: 43,
    content: '酒酣胸胆尚开张，鬓微霜，又何妨',
    source: '《江城子·密州出猎》',
    period: '知密州时期',
    year: 1075,
    appreciation: '酒意正浓，胸怀开阔，胆气豪壮，即使鬓发微霜，又有什么关系？表现了词人的豪迈。',
    tags: ['豪放', '豪迈', '壮志'],
    fullPoetry: `老夫聊发少年狂，左牵黄，右擎苍，
锦帽貂裘，千骑卷平冈。
为报倾城随太守，亲射虎，看孙郎。

酒酣胸胆尚开张，鬓微霜，又何妨！
持节云中，何日遣冯唐？
会挽雕弓如满月，西北望，射天狼。`,
  },
  {
    id: 44,
    content: '故国神游，多情应笑我，早生华发',
    source: '《念奴娇·赤壁怀古》',
    period: '黄州时期',
    year: 1082,
    appreciation: '神游故国，应该笑我多愁善感，过早地长出了白发。表达了对人生短暂的感慨。',
    tags: ['怀古', '感慨', '人生'],
    fullPoetry: `大江东去，浪淘尽，千古风流人物。
故垒西边，人道是，三国周郎赤壁。
乱石穿空，惊涛拍岸，卷起千堆雪。
江山如画，一时多少豪杰。

遥想公瑾当年，小乔初嫁了，雄姿英发。
羽扇纶巾，谈笑间，樯橹灰飞烟灭。
故国神游，多情应笑我，早生华发。
人生如梦，一尊还酹江月。`,
  },
  {
    id: 45,
    content: '乱石穿空，惊涛拍岸，卷起千堆雪',
    source: '《念奴娇·赤壁怀古》',
    period: '黄州时期',
    year: 1082,
    appreciation: '陡峭的山崖刺破天空，惊人的巨浪拍打着江岸，卷起千堆雪白的浪花。写出了赤壁的壮丽景色。',
    tags: ['写景', '壮丽', '气势'],
    fullPoetry: `大江东去，浪淘尽，千古风流人物。
故垒西边，人道是，三国周郎赤壁。
乱石穿空，惊涛拍岸，卷起千堆雪。
江山如画，一时多少豪杰。

遥想公瑾当年，小乔初嫁了，雄姿英发。
羽扇纶巾，谈笑间，樯橹灰飞烟灭。
故国神游，多情应笑我，早生华发。
人生如梦，一尊还酹江月。`,
  },
  {
    id: 46,
    content: '缺月挂疏桐，漏断人初静',
    source: '《卜算子·黄州定慧院寓居作》',
    period: '黄州时期',
    year: 1080,
    appreciation: '残月挂在稀疏的梧桐树上，漏壶的水已滴尽，四周一片寂静。写出了深夜的孤寂。',
    tags: ['孤寂', '夜景', '黄州'],
    fullPoetry: `缺月挂疏桐，漏断人初静。
谁见幽人独往来，缥缈孤鸿影。

惊起却回头，有恨无人省。
拣尽寒枝不肯栖，寂寞沙洲冷。`,
  },
  {
    id: 47,
    content: '谁见幽人独往来，缥缈孤鸿影',
    source: '《卜算子·黄州定慧院寓居作》',
    period: '黄州时期',
    year: 1080,
    appreciation: '有谁见到幽居之人独自往来，只有那缥缈的孤鸿的影子。表达了词人的孤独。',
    tags: ['孤独', '自喻', '黄州'],
    fullPoetry: `缺月挂疏桐，漏断人初静。
谁见幽人独往来，缥缈孤鸿影。

惊起却回头，有恨无人省。
拣尽寒枝不肯栖，寂寞沙洲冷。`,
  },
  {
    id: 48,
    content: '水光潋滟晴方好，山色空蒙雨亦奇',
    source: '《饮湖上初晴后雨》',
    period: '通判杭州时期',
    year: 1073,
    appreciation: '晴天时西湖波光粼粼，雨天时山色朦胧。写出了西湖晴雨皆宜的美景。',
    tags: ['写景', '西湖', '美景'],
    fullPoetry: `水光潋滟晴方好，山色空蒙雨亦奇。
欲把西湖比西子，淡妆浓抹总相宜。`,
  },
  {
    id: 49,
    content: '横看成岭侧成峰，远近高低各不同',
    source: '《题西林壁》',
    period: '移汝州时期',
    year: 1084,
    appreciation: '从正面看是山岭，从侧面看是山峰，从远近高低不同角度看都不同。写出了庐山的变幻多姿。',
    tags: ['哲理', '山水', '思辨'],
    fullPoetry: `横看成岭侧成峰，远近高低各不同。
不识庐山真面目，只缘身在此山中。`,
  },
  {
    id: 50,
    content: '夜来幽梦忽还乡，小轩窗，正梳妆',
    source: '《江城子·乙卯正月二十日夜记梦》',
    period: '知密州时期',
    year: 1075,
    appreciation: '夜晚梦见回到故乡，看见你在窗前梳妆。写出了对亡妻的深深思念。',
    tags: ['悼亡', '梦境', '思念'],
    fullPoetry: `十年生死两茫茫，不思量，自难忘。
千里孤坟，无处话凄凉。
纵使相逢应不识，尘满面，鬓如霜。

夜来幽梦忽还乡，小轩窗，正梳妆。
相顾无言，惟有泪千行。
料得年年肠断处，明月夜，短松冈。`,
  },
  {
    id: 51,
    content: '罗浮山下四时春，卢橘杨梅次第新',
    source: '《惠州一绝》',
    period: '贬惠州时期',
    year: 1095,
    appreciation: '罗浮山下四季如春，卢橘和杨梅依次成熟。写出了岭南的美好生活。',
    tags: ['生活', '岭南', '乐观'],
    fullPoetry: `罗浮山下四时春，卢橘杨梅次第新。
日啖荔枝三百颗，不辞长作岭南人。`,
  },
  {
    id: 52,
    content: '心似已灰之木，身如不系之舟',
    source: '《自题金山画像》',
    period: '北归时期',
    year: 1100,
    appreciation: '心像已烧成灰的木头，身如没有系绳的小船。表达了词人晚年的心境。',
    tags: ['人生', '感慨', '晚年'],
    fullPoetry: `心似已灰之木，身如不系之舟。
问汝平生功业，黄州惠州儋州。`,
  },
];

// 高亮显示名句的函数
function highlightQuote(fullText: string, quote: string) {
  // 清理名句中的标点符号以便匹配
  const cleanQuote = quote.replace(/[?.?!,.!]/g, '');
  const cleanText = fullText.replace(/[?.?!,.!]/g, '');

  // 找到名句在全文中的位置
  const index = cleanText.indexOf(cleanQuote);
  if (index === -1) return fullText;

  // 使用正则表达式高亮显示
  const escapedQuote = quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuote})`, 'g');
  return fullText.replace(regex, '<mark class="bg-yellow-200 text-amber-900 px-1 rounded">$1</mark>');
}

export function QuotesPage() {
  const navigate = useNavigate();
  const [selectedQuote, setSelectedQuote] = useState<typeof FAMOUS_QUOTES[0] | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // 搜索和筛选状态 - 用于右侧诗词列表
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedPattern, setSelectedPattern] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [activeTab, setActiveTab] = useState<'period' | 'genre' | 'pattern' | 'style'>('period');

  // 诗词列表分页状态
  const [poetryPage, setPoetryPage] = useState(1);
  const poetryPageSize = 37; // 每页显示 37 首，与右侧名句高度对齐

  // 搜索时重置页码
  useEffect(() => {
    setPoetryPage(1);
  }, [searchQuery]);

  // 从 API 获取诗词数据（分 3 页加载，每页 100 首，共 300 首）
  const { data: page1, isLoading: l1, isSuccess: s1 } = usePoetries(1, 100);
  const { data: page2, isLoading: l2, isSuccess: s2 } = usePoetries(2, 100);
  const { data: page3, isLoading: l3, isSuccess: s3 } = usePoetries(3, 100);

  const allPoetries = useMemo(() => {
    const combined = [
      ...(page1?.items || []),
      ...(page2?.items || []),
      ...(page3?.items || []),
    ];
    console.log('[QuotesPage] Combined poetries:', combined.length, 'page1 items:', page1?.items?.length, 'page2 items:', page2?.items?.length, 'page3 items:', page3?.items?.length);
    return combined;
  }, [page1, page2, page3]);

  const isDataLoaded = s1 && s2 && s3;
  const totalCount = isDataLoaded ? allPoetries.length : 0;

  // 筛选全部诗词（带分页）
  const filteredPoetries = useMemo(() => {
    let result = allPoetries;

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(poetry =>
        poetry.title.toLowerCase().includes(query) ||
        poetry.content?.toLowerCase().includes(query) ||
        poetry.period?.toLowerCase().includes(query) ||
        poetry.tags?.toLowerCase().includes(query) ||
        poetry.genre?.toLowerCase().includes(query)
      );
    }

    // 时期筛选
    if (selectedPeriod !== 'all') {
      result = result.filter(poetry => poetry.period?.includes(selectedPeriod));
    }

    // 词牌名筛选
    if (selectedPattern !== 'all') {
      if (selectedPattern === '其他') {
        const knownPatterns = CI_PATTERNS.filter(p => p.id !== 'all' && p.id !== '其他').map(p => p.id);
        result = result.filter(poetry =>
          !knownPatterns.some(pattern => poetry.title.includes(pattern))
        );
      } else {
        result = result.filter(poetry => poetry.title.includes(selectedPattern));
      }
    }

    // 题材筛选
    if (selectedGenre !== 'all') {
      result = result.filter(poetry => poetry.genre === selectedGenre);
    }

    // 风格筛选
    if (selectedStyle !== 'all') {
      result = result.filter(poetry => poetry.tags?.includes(selectedStyle));
    }

    // 分页
    const start = (poetryPage - 1) * poetryPageSize;
    const end = start + poetryPageSize;
    return result.slice(start, end);
  }, [searchQuery, allPoetries, poetryPage, selectedPeriod, selectedPattern, selectedGenre, selectedStyle]);

  // 计算总诗词数（用于分页显示）
  const totalPoetryCount = useMemo(() => {
    let count = allPoetries.length;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      count = allPoetries.filter(poetry =>
        poetry.title.toLowerCase().includes(query) ||
        poetry.content?.toLowerCase().includes(query) ||
        poetry.period?.toLowerCase().includes(query) ||
        poetry.tags?.toLowerCase().includes(query) ||
        poetry.genre?.toLowerCase().includes(query)
      ).length;
    }

    if (selectedPeriod !== 'all') {
      count = allPoetries.filter(poetry => poetry.period?.includes(selectedPeriod)).length;
    }

    if (selectedPattern !== 'all') {
      if (selectedPattern === '其他') {
        const knownPatterns = CI_PATTERNS.filter(p => p.id !== 'all' && p.id !== '其他').map(p => p.id);
        count = allPoetries.filter(poetry =>
          !knownPatterns.some(pattern => poetry.title.includes(pattern))
        ).length;
      } else {
        count = allPoetries.filter(poetry => poetry.title.includes(selectedPattern)).length;
      }
    }

    if (selectedGenre !== 'all') {
      count = allPoetries.filter(poetry => poetry.genre === selectedGenre).length;
    }

    if (selectedStyle !== 'all') {
      count = allPoetries.filter(poetry => poetry.tags?.includes(selectedStyle)).length;
    }

    return count;
  }, [searchQuery, allPoetries, selectedPeriod, selectedPattern, selectedGenre, selectedStyle]);

  // 计算总页数
  const totalPoetryPages = useMemo(() => {
    return Math.ceil(totalPoetryCount / poetryPageSize);
  }, [totalPoetryCount, poetryPageSize]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const onCopy = (quote: typeof FAMOUS_QUOTES[0]) => {
    navigator.clipboard.writeText(`${quote.content}\n——${quote.source}`);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧 + 中间 - 合并为诗词列表区域 */}
      <div className="flex-1 flex flex-col overflow-hidden border-r">
        {/* 顶部标签栏 - 与右侧名句赏析对齐 */}
        <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-6 px-6 shrink-0">
          <h2 className="text-xl font-bold mb-1">全部诗词</h2>
          <p className="text-primary-100 text-xs">数据库共 {totalCount} 首，跟着东坡足迹读诗词</p>
        </div>

        {/* 顶部筛选栏 */}
        <div className="bg-white border-b p-4 shrink-0">
          <div className="flex items-start gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索诗词、词牌、时期..."
                className="w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* 分类按钮 */}
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-colors border',
                  selectedPeriod === 'all' && selectedGenre === 'all' && selectedPattern === 'all' && selectedStyle === 'all' && searchQuery === ''
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-slate-100 border-slate-200'
                )}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPeriod('all');
                  setSelectedGenre('all');
                  setSelectedPattern('all');
                  setSelectedStyle('all');
                }}
              >
                📖 全部诗词 ( {totalCount} )
              </button>
            </div>

            {/* 筛选条件展示 */}
            {(selectedPeriod !== 'all' || selectedGenre !== 'all' || selectedPattern !== 'all' || selectedStyle !== 'all') && (
              <div className="flex items-center gap-2 flex-1">
                {selectedPeriod !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    时期：{PERIODS.find(p => p.id === selectedPeriod)?.name}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => setSelectedPeriod('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedGenre !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    题材：{GENRES.find(g => g.id === selectedGenre)?.name}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => setSelectedGenre('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedPattern !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    词牌：{CI_PATTERNS.find(p => p.id === selectedPattern)?.name}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => setSelectedPattern('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedStyle !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    风格：{STYLES.find(s => s.id === selectedStyle)?.name}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => setSelectedStyle('all')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* 筛选 Tab */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">筛选：</span>
            <button
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
                activeTab === 'period'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
              )}
              onClick={() => setActiveTab('period')}
            >
              按时期
            </button>
            <button
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
                activeTab === 'genre'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
              )}
              onClick={() => setActiveTab('genre')}
            >
              按题材
            </button>
            <button
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
                activeTab === 'pattern'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
              )}
              onClick={() => setActiveTab('pattern')}
            >
              按词牌
            </button>
            <button
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
                activeTab === 'style'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
              )}
              onClick={() => setActiveTab('style')}
            >
              按风格
            </button>
          </div>

          {/* 筛选选项 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {activeTab === 'period' && PERIODS.filter(p => p.id !== 'all').map((period) => (
              <button
                key={period.id}
                className={cn(
                  'px-3 py-1 text-sm rounded-md border transition-colors',
                  selectedPeriod === period.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                )}
                onClick={() => setSelectedPeriod(period.id === selectedPeriod ? 'all' : period.id)}
              >
                {period.name}
              </button>
            ))}
            {activeTab === 'genre' && GENRES.filter(g => g.id !== 'all').map((genre) => (
              <button
                key={genre.id}
                className={cn(
                  'px-3 py-1 text-sm rounded-md border transition-colors',
                  selectedGenre === genre.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                )}
                onClick={() => setSelectedGenre(genre.id === selectedGenre ? 'all' : genre.id)}
              >
                {genre.name}
              </button>
            ))}
            {activeTab === 'pattern' && CI_PATTERNS.filter(p => p.id !== 'all').map((pattern) => (
              <button
                key={pattern.id}
                className={cn(
                  'px-3 py-1 text-sm rounded-md border transition-colors',
                  selectedPattern === pattern.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                )}
                onClick={() => setSelectedPattern(pattern.id === selectedPattern ? 'all' : pattern.id)}
              >
                {pattern.name}
              </button>
            ))}
            {activeTab === 'style' && STYLES.filter(s => s.id !== 'all').map((style) => (
              <button
                key={style.id}
                className={cn(
                  'px-3 py-1 text-sm rounded-md border transition-colors',
                  selectedStyle === style.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                )}
                onClick={() => setSelectedStyle(style.id === selectedStyle ? 'all' : style.id)}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* 诗词列表 */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredPoetries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">暂无诗词</p>
              </div>
            ) : (
              filteredPoetries.map((poetry) => (
                <button
                  key={poetry.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-200 transition-colors border border-transparent hover:border-slate-300"
                  onClick={() => navigate(`/poetry/${poetry.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {poetry.genre && <span className="text-muted-foreground mr-1">【{poetry.genre}】</span>}
                        {poetry.title}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* 分页控制 */}
        {totalPoetryPages > 1 && (
          <div className="p-4 border-t bg-white shrink-0">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={poetryPage === 1}
                onClick={() => setPoetryPage(poetryPage - 1)}
                className="w-8 h-8 p-0"
              >
                ‹
              </Button>

              {Array.from({ length: totalPoetryPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={poetryPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPoetryPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={poetryPage === totalPoetryPages}
                onClick={() => setPoetryPage(poetryPage + 1)}
                className="w-8 h-8 p-0"
              >
                ›
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              第 {poetryPage} / {totalPoetryPages} 页 · 本页 {filteredPoetries.length} 首
            </p>
          </div>
        )}
      </div>

      {/* 右侧 - 名句赏析 */}
      <div className="w-[960px] border-l bg-slate-50 flex flex-col shrink-0">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-6 px-6">
          <h2 className="text-xl font-bold mb-1">苏轼名句赏析</h2>
          <p className="text-amber-100 text-xs">千古传诵的经典名句</p>
        </div>

        {/* 名句卡片列表 */}
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-3 gap-3">
            {FAMOUS_QUOTES.map((quote) => (
              <Card
                key={quote.id}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                onClick={() => setSelectedQuote(quote)}
              >
                <CardContent className="p-4">
                  <p className="text-sm font-medium leading-relaxed line-clamp-3">
                    "{quote.content}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    ——{quote.source}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* 统计信息 */}
        <div className="p-3 border-t bg-white">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{FAMOUS_QUOTES.length}</p>
            <p className="text-xs text-muted-foreground">名句</p>
          </div>
        </div>
      </div>

      {/* 名句详情弹窗 - 显示完整诗词 */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedQuote(null)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedQuote.content}</h2>
                  <p className="text-muted-foreground">
                    ——《{selectedQuote.source}》
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedQuote(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedQuote.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline">{selectedQuote.period}</Badge>
                <span className="text-sm text-muted-foreground self-center">{selectedQuote.year}年</span>
              </div>

              {/* 完整诗词 */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-lg mb-4 text-center">完整诗词</h3>
                <div
                  className="text-lg leading-loose text-center font-serif whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: highlightQuote(selectedQuote.fullPoetry, selectedQuote.content)
                  }}
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">赏析</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedQuote.appreciation}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onCopy(selectedQuote);
                  }}
                >
                  {copiedId === selectedQuote.id ? '已复制' : '复制名句'}
                </Button>
                <Button
                  variant={favorites.includes(selectedQuote.id) ? 'default' : 'outline'}
                  onClick={() => toggleFavorite(selectedQuote.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${favorites.includes(selectedQuote.id) ? 'fill-white' : ''}`} />
                  {favorites.includes(selectedQuote.id) ? '已收藏' : '收藏'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
