// 人生大事记组件
import { Badge } from '@/components/ui/badge';

// 苏轼人生大事记数据
const LIFE_EVENTS = [
  { year: 1037, title: '出生', description: '生于眉州眉山（今四川眉山）', type: 'birth', locationIds: [1] },
  { year: 1057, title: '进士及第', description: '中进士，名动京师', type: 'achievement', locationIds: [] },
  { year: 1061, title: '签书凤翔府判官', description: '初入仕途', type: 'career', locationIds: [3] },
  { year: 1069, title: '通判杭州', description: '因反对新法外放', type: 'career', locationIds: [4] },
  { year: 1075, title: '知密州', description: '作《江城子·密州出猎》', type: 'career', locationIds: [5] },
  { year: 1079, title: '乌台诗案', description: '因诗获罪，贬黄州', type: 'crisis', locationIds: [6] },
  { year: 1080, title: '黄州团练副使', description: '创作高峰，作《赤壁赋》', type: 'career', locationIds: [6] },
  { year: 1084, title: '移汝州', description: '游庐山，作《题西林壁》', type: 'career', locationIds: [11] },
  { year: 1089, title: '知杭州', description: '疏浚西湖，筑苏堤', type: 'achievement', locationIds: [4] },
  { year: 1094, title: '贬惠州', description: '晚年再贬', type: 'crisis', locationIds: [8] },
  { year: 1097, title: '贬儋州', description: '海南开拓文化', type: 'crisis', locationIds: [9] },
  { year: 1100, title: '北归', description: '遇赦北还', type: 'career', locationIds: [] },
  { year: 1101, title: '卒于常州', description: '享年六十五岁', type: 'death', locationIds: [7] },
];

interface LifeEventsProps {
  onEventClick?: (year: number, locationIds?: number[]) => void;
  className?: string;
}

export function LifeEvents({ onEventClick, className = '' }: LifeEventsProps) {
  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'birth':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'death':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'crisis':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birth':
        return '🌱';
      case 'death':
        return '🕯️';
      case 'achievement':
        return '🏆';
      case 'crisis':
        return '⚡';
      default:
        return '📜';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-semibold text-lg">苏轼生平</h3>
      <div className="space-y-2">
        {LIFE_EVENTS.map((event) => (
          <button
            key={event.year}
            onClick={() => onEventClick?.(event.year, event.locationIds)}
            className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{getEventIcon(event.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getEventTypeStyle(event.type)}>
                    {event.title}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">
                    {event.year}年
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
