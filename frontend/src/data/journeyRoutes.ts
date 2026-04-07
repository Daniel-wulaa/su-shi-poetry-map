// 苏轼人生旅程路线数据
// 根据不同时期和事件分类，每段旅程用不同颜色表示
// 地点 ID 对照后端数据库 locations 表（2026-04-01 更新）

export interface JourneyRoute {
  id: number;
  name: string;
  description: string;
  story: string; // 详细故事描述
  color: string;
  period: string;
  yearRange: string;
  poetries: {
    id: number;
    title: string;
    year?: number;
  }[]; // 这段旅程期间创作的诗词
  waypoints: {
    locationId: number;
    name: string;
    latitude: number;
    longitude: number;
    year: number;
    event?: string;
  }[];
}

// 苏轼关键旅程路线 - 地点 ID 参照后端数据库
export const JOURNEY_ROUTES: JourneyRoute[] = [
  {
    id: 1,
    name: '少年求学·出川入京',
    description: '嘉祐元年（1056 年），苏轼与父苏洵、弟苏辙出川赴京参加科举',
    story: '嘉祐元年（1056 年），20 岁的苏轼与父亲苏洵、弟弟苏辙一起离开家乡眉州，沿长江东下，经成都、长安，最终抵达北宋都城汴京。次年，苏轼兄弟同科进士及第，名动京师。主考官欧阳修对苏轼的文章极为赞赏，曾对人说："吾当避此人出一头地。"这段求学之路，开启了苏轼辉煌的人生篇章。',
    color: '#22c55e',
    period: '青年时期',
    yearRange: '1056-1057',
    poetries: [],
    waypoints: [
      { locationId: 1, name: '眉州', latitude: 30.0566, longitude: 103.8397, year: 1056, event: '从家乡出发' },
      { locationId: 2, name: '成都', latitude: 30.5728, longitude: 104.0668, year: 1056, event: '途经成都' },
      { locationId: 3, name: '长安', latitude: 34.3416, longitude: 108.9398, year: 1056, event: '经长安' },
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1057, event: '进士及第' },
    ],
  },
  {
    id: 2,
    name: '凤翔签判·初入仕途',
    description: '嘉祐六年（1061 年），苏轼任凤翔府签判，开始仕途',
    story: '嘉祐六年（1061 年），26 岁的苏轼被任命为凤翔府签判，这是他人生中的第一个官职。在凤翔期间，苏轼勤政爱民，兴修水利，减免赋税，深受百姓爱戴。他常到民间走访，了解百姓疾苦，这段经历为他后来的文学创作积累了丰富的素材。',
    color: '#3b82f6',
    period: '早期仕途',
    yearRange: '1061-1065',
    poetries: [
      { id: 101, title: '和子由渑池怀旧', year: 1061 },
      { id: 102, title: '凤翔八观·石鼓歌', year: 1062 },
    ],
    waypoints: [
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1061, event: '从京城出发' },
      { locationId: 6, name: '凤翔府', latitude: 34.5158, longitude: 107.4000, year: 1061, event: '任凤翔府签判' },
    ],
  },
  {
    id: 3,
    name: '杭州通判·江南初仕',
    description: '熙宁四年（1071 年），苏轼因与王安石政见不合，自请外放，任杭州通判',
    story: '熙宁四年（1071 年），因反对王安石新法，苏轼自请外放，被任命为杭州通判。杭州的湖光山色让苏轼流连忘返，他治理西湖，疏浚河道，为民办实事。这期间，苏轼创作了大量描绘西湖美景的诗篇，"欲把西湖比西子，淡妆浓抹总相宜"成为千古绝唱。',
    color: '#06b6d4',
    period: '外放时期',
    yearRange: '1071-1074',
    poetries: [
      { id: 201, title: '饮湖上初晴后雨', year: 1073 },
      { id: 202, title: '蝶恋花·春景', year: 1073 },
      { id: 203, title: '六月二十七日望湖楼醉书', year: 1073 },
    ],
    waypoints: [
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1071, event: '离京赴任' },
      { locationId: 5, name: '陈州', latitude: 33.7989, longitude: 114.9007, year: 1071, event: '途经陈州' },
      { locationId: 7, name: '杭州', latitude: 30.2741, longitude: 120.1551, year: 1071, event: '任杭州通判' },
    ],
  },
  {
    id: 4,
    name: '山东三州·知州历练',
    description: '熙宁七年至熙宁十年（1074-1078 年），先后任密州、徐州、湖州知州',
    story: '熙宁七年至熙宁十年（1074-1078 年），苏轼先后任密州、徐州、湖州知州。在密州，他率民抗旱，捕蝗救灾，写下了"老夫聊发少年狂"的豪迈词句；在徐州，他率领军民抗洪保城，"庐于城上，过家不入"；在湖州，他因《湖州谢上表》被指讥讽朝政，埋下了乌台诗案的祸根。',
    color: '#f59e0b',
    period: '知州时期',
    yearRange: '1074-1079',
    poetries: [
      { id: 301, title: '江城子·密州出猎', year: 1075 },
      { id: 302, title: '水调歌头·明月几时有', year: 1076 },
      { id: 303, title: '江城子·乙卯正月二十日夜记梦', year: 1075 },
    ],
    waypoints: [
      { locationId: 7, name: '杭州', latitude: 30.2741, longitude: 120.1551, year: 1074, event: '离杭州' },
      { locationId: 8, name: '密州', latitude: 35.9958, longitude: 119.4119, year: 1075, event: '知密州' },
      { locationId: 9, name: '徐州', latitude: 34.2056, longitude: 117.2848, year: 1078, event: '知徐州' },
      { locationId: 10, name: '湖州', latitude: 30.8703, longitude: 120.0972, year: 1079, event: '知湖州' },
    ],
  },
  {
    id: 5,
    name: '乌台诗案·贬谪黄州',
    description: '元丰二年（1079 年），因乌台诗案入狱，后贬为黄州团练副使',
    story: '元丰二年（1079 年），苏轼因"乌台诗案"被捕入狱，险些丧命。后经多方营救，贬为黄州团练副使。黄州四年，是苏轼人生的低谷，却是他文学创作的高峰。他躬耕东坡，自号"东坡居士"，写下了《念奴娇·赤壁怀古》《前赤壁赋》《后赤壁赋》等千古名篇。',
    color: '#ef4444',
    period: '贬谪时期',
    yearRange: '1079-1084',
    poetries: [
      { id: 401, title: '念奴娇·赤壁怀古', year: 1082 },
      { id: 402, title: '前赤壁赋', year: 1082 },
      { id: 403, title: '后赤壁赋', year: 1082 },
      { id: 404, title: '定风波·莫听穿林打叶声', year: 1082 },
      { id: 405, title: '卜算子·黄州定慧院寓居作', year: 1082 },
      { id: 406, title: '浣溪沙·游蕲水清泉寺', year: 1082 },
    ],
    waypoints: [
      { locationId: 10, name: '湖州', latitude: 30.8703, longitude: 120.0972, year: 1079, event: '被捕入京' },
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1079, event: '乌台受审' },
      { locationId: 11, name: '黄州', latitude: 30.4518, longitude: 114.8797, year: 1080, event: '贬黄州团练副使' },
    ],
  },
  {
    id: 6,
    name: '回京拜相·短暂辉煌',
    description: '元丰八年（1085 年）后，哲宗即位，高太后听政，苏轼被召回京',
    story: '元丰八年（1085 年），哲宗即位，高太后听政，旧党重新得势，苏轼被召回京城。短短数月间，他从一名贬官升任翰林学士，知制诰，达到了仕途的顶峰。然而，苏轼因与司马光等旧党领袖政见不合，再次自请外放。',
    color: '#a855f7',
    period: '回京时期',
    yearRange: '1085-1089',
    poetries: [
      { id: 501, title: '惠崇春江晚景', year: 1085 },
    ],
    waypoints: [
      { locationId: 11, name: '黄州', latitude: 30.4518, longitude: 114.8797, year: 1085, event: '离黄州' },
      { locationId: 19, name: '登州', latitude: 37.8155, longitude: 120.7572, year: 1085, event: '知登州' },
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1086, event: '回京任翰林学士' },
    ],
  },
  {
    id: 7,
    name: '再知杭州·疏浚西湖',
    description: '元祐四年（1089 年），苏轼再任杭州知州，疏浚西湖，筑苏堤',
    story: '元祐四年（1089 年），苏轼再任杭州知州。此时的杭州西湖已淤塞严重，苏轼组织民工疏浚西湖，用挖出的淤泥筑成一道长堤，后人称之为"苏堤"。苏堤春晓，成为西湖十景之一。苏轼在杭州期间，还建立了中国最早的公立医院"安乐坊"，造福百姓。',
    color: '#14b8a6',
    period: '地方治理',
    yearRange: '1089-1091',
    poetries: [
      { id: 601, title: '临江仙·送钱穆父', year: 1091 },
    ],
    waypoints: [
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1089, event: '离京赴任' },
      { locationId: 7, name: '杭州', latitude: 30.2741, longitude: 120.1551, year: 1089, event: '知杭州，筑苏堤' },
    ],
  },
  {
    id: 8,
    name: '颍州扬州·地方任职',
    description: '元祐六年至七年（1091-1092 年），先后任颍州、扬州知州',
    story: '元祐六年至七年（1091-1092 年），苏轼先后任颍州、扬州知州。在颍州，他疏浚颍州西湖，治理水患；在扬州，他改革税制，减轻百姓负担。苏轼每到一处，都勤政爱民，深受百姓爱戴。',
    color: '#f97316',
    period: '地方任职',
    yearRange: '1091-1093',
    poetries: [],
    waypoints: [
      { locationId: 7, name: '杭州', latitude: 30.2741, longitude: 120.1551, year: 1091, event: '离杭州' },
      { locationId: 20, name: '颍州', latitude: 32.8979, longitude: 115.8162, year: 1091, event: '知颍州' },
      { locationId: 13, name: '扬州', latitude: 32.3912, longitude: 119.4215, year: 1092, event: '知扬州' },
    ],
  },
  {
    id: 9,
    name: '一贬再贬·远谪岭南',
    description: '绍圣元年（1094 年），新党执政，苏轼一贬再贬，远谪惠州',
    story: '绍圣元年（1094 年），新党重新执政，苏轼被一贬再贬，先贬英州，再贬惠州。此时的苏轼已年近六旬，但他依然乐观豁达。在惠州，他写下了"日啖荔枝三百颗，不辞长作岭南人"的诗句，表现出随遇而安的旷达情怀。',
    color: '#dc2626',
    period: '远谪时期',
    yearRange: '1094-1097',
    poetries: [
      { id: 801, title: '惠州一绝', year: 1095 },
      { id: 802, title: '十一月二十六日松风亭下梅花盛开', year: 1096 },
    ],
    waypoints: [
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1094, event: '被贬离京' },
      { locationId: 15, name: '英州', latitude: 24.2820, longitude: 113.4147, year: 1094, event: '贬英州' },
      { locationId: 14, name: '惠州', latitude: 23.1115, longitude: 114.4152, year: 1095, event: '贬惠州安置' },
    ],
  },
  {
    id: 10,
    name: '渡海贬儋·天涯海角',
    description: '绍圣四年（1097 年），苏轼再贬儋州（今海南儋州），跨越琼州海峡',
    story: '绍圣四年（1097 年），62 岁的苏轼被再贬儋州（今海南儋州）。在宋代，儋州是蛮荒之地，瘴疠横行。苏轼渡海来到儋州，办学传道，教化百姓，培养出了海南历史上第一位举人姜唐佐。他在儋州三年，著书立说，传播中原文化，为海南的文化发展做出了重要贡献。',
    color: '#7c3aed',
    period: '海南时期',
    yearRange: '1097-1100',
    poetries: [
      { id: 901, title: '纵笔三首', year: 1098 },
      { id: 902, title: '谪居三适', year: 1099 },
    ],
    waypoints: [
      { locationId: 14, name: '惠州', latitude: 23.1115, longitude: 114.4152, year: 1097, event: '离惠州' },
      { locationId: 21, name: '雷州', latitude: 20.9117, longitude: 110.0858, year: 1097, event: '抵雷州半岛' },
      { locationId: 16, name: '儋州', latitude: 19.5237, longitude: 109.5771, year: 1097, event: '渡海抵儋州' },
    ],
  },
  {
    id: 11,
    name: '北归中原·魂归常州',
    description: '元符三年（1100 年）徽宗即位，苏轼遇赦北归，建中靖国元年（1101 年）卒于常州',
    story: '元符三年（1100 年），徽宗即位，苏轼遇赦北归。此时的苏轼已 65 岁高龄，历经七年贬谪生涯，身心俱疲。他沿路北上，再经雷州、惠州、赣州，最终抵达常州。建中靖国元年（1101 年）七月二十八日，苏轼在常州病逝，享年 66 岁。临终前，他写下"问汝平生功业，黄州惠州儋州"，概括了自己跌宕起伏的一生。',
    color: '#6b7280',
    period: '北归时期',
    yearRange: '1100-1101',
    poetries: [
      { id: 1001, title: '六月二十日夜渡海', year: 1100 },
      { id: 1002, title: '自题金山画像', year: 1101 },
    ],
    waypoints: [
      { locationId: 16, name: '儋州', latitude: 19.5237, longitude: 109.5771, year: 1100, event: '遇赦北归' },
      { locationId: 21, name: '雷州', latitude: 20.9117, longitude: 110.0858, year: 1100, event: '再经雷州' },
      { locationId: 14, name: '惠州', latitude: 23.1115, longitude: 114.4152, year: 1100, event: '再过惠州' },
      { locationId: 22, name: '赣州', latitude: 25.8452, longitude: 114.9335, year: 1100, event: '经赣州' },
      { locationId: 12, name: '常州', latitude: 31.8122, longitude: 119.9692, year: 1101, event: '病逝于常州' },
    ],
  },
];

// 按年份获取旅程路线
export function getJourneyRoutesByYear(year: number): JourneyRoute[] {
  return JOURNEY_ROUTES.filter(route => {
    const [startYear, endYear] = route.yearRange.split('-').map(Number);
    return year >= startYear && year <= endYear;
  });
}

// 获取某年份的路线 waypoints
export function getJourneyWaypointsByYear(year: number): JourneyRoute['waypoints'] {
  const routes = getJourneyRoutesByYear(year);
  return routes.flatMap(route => route.waypoints);
}
