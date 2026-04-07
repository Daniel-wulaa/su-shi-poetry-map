// 探索页面 - 整合地图和时间线
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer } from '@/modules/map/MapContainer';
import { TimelineView, TimelineFilter, LifeEvents } from '@/modules/timeline';
import { useAllLocations, usePoetries, useLocationPoetries } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, X, Route, Share } from 'lucide-react';
import type { Location } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { JOURNEY_ROUTES } from '@/data/journeyRoutes';
import { getLocalPoetry, type LocalPoetry } from '@/data/localPoetries';
import { ShareModal } from '@/modules/share/ShareModal';

export function ExplorePage() {
  const navigate = useNavigate();
  const { data: locations } = useAllLocations();
  const { data: poetriesData } = usePoetries(1, 100);

  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<typeof JOURNEY_ROUTES[0] | null>(null);
  const [selectedPoetry, setSelectedPoetry] = useState<LocalPoetry | null>(null);
  const [showPoetryShare, setShowPoetryShare] = useState(false);
  const [showJourneyRoutes, setShowJourneyRoutes] = useState(true);

  // 获取地点相关诗词
  const { data: locationPoetries } = useLocationPoetries(selectedLocation?.id || 0);

  // 根据选中的地点 ID 筛选地点
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (!selectedLocationIds || selectedLocationIds.length === 0) return locations;
    return locations.filter(loc => selectedLocationIds.includes(loc.id));
  }, [locations, selectedLocationIds]);

  const handleYearSelect = (year: number, locationIds?: number[]) => {
    const newSelectedYear = year === selectedYear ? null : year;
    setSelectedYear(newSelectedYear);
    // 如果选择了年份，同时设置要定位的地点 ID
    setSelectedLocationIds(newSelectedYear && locationIds ? locationIds : null);
  };

  const handleFilterChange = (_startYear: number, _endYear: number) => {
    // 时间筛选功能预留
    console.log('年份筛选:', _startYear, _endYear);
  };

  // 处理地点选择 - 使用 useCallback 确保引用稳定
  const handleLocationSelect = useCallback((location: Location) => {
    console.log('[ExplorePage] 地点被选中:', location);
    setSelectedLocation(location);
  }, []);

  console.log('[ExplorePage] render - selectedLocation:', selectedLocation ? selectedLocation.name : 'null');
  console.log('[ExplorePage] filteredLocations:', filteredLocations.length, 'selectedLocationIds:', selectedLocationIds);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* 地图 */}
      <div className="absolute inset-0">
        <MapContainer
          locations={filteredLocations}
          onLocationClick={handleLocationSelect}
          focusOnLocationIds={selectedLocationIds}
          showJourneyRoutes={showJourneyRoutes}
        />
      </div>

      {/* 旅程路线控制按钮 */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant={showJourneyRoutes ? "default" : "outline"}
          size="sm"
          onClick={() => setShowJourneyRoutes(!showJourneyRoutes)}
          className="bg-white/90 backdrop-blur"
        >
          <Route className="h-4 w-4 mr-2" />
          {showJourneyRoutes ? '隐藏路线' : '显示路线'}
        </Button>
      </div>

      {/* 侧边栏 */}
      <div
        className={`absolute top-0 left-0 h-full w-96 bg-card border-r shadow-lg transition-transform duration-300 z-20 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            苏轼人生诗词地图
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-4 space-y-6">
            {/* 旅程路线图例 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Route className="h-4 w-4" />
                苏轼人生旅程
              </h3>
              <div className="space-y-2">
                {JOURNEY_ROUTES.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-start gap-2 text-xs p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => {
                      // 点击路线定位到该路线的起点
                      setSelectedJourney(route);
                      const firstWaypoint = route.waypoints[0];
                      if (firstWaypoint) {
                        // 定位到起点坐标
                        const startLocation = locations?.find(loc =>
                          loc.id === firstWaypoint.locationId ||
                          loc.name.includes(firstWaypoint.name) ||
                          firstWaypoint.name.includes(loc.name)
                        );
                        if (startLocation) {
                          setSelectedLocation(startLocation);
                        } else {
                          // 如果找不到关联地点，使用 waypoint 自带坐标创建临时地点
                          setSelectedLocation({
                            id: `journey-${route.id}`,
                            name: firstWaypoint.name,
                            ancient_name: firstWaypoint.name,
                            latitude: firstWaypoint.latitude,
                            longitude: firstWaypoint.longitude,
                            description: route.description,
                            city: null,
                            province: null,
                            address: null,
                            attraction_info: null,
                            images: null,
                            created_at: '',
                            updated_at: null,
                          } as unknown as Location);
                        }
                      }
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: route.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{route.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {route.yearRange} · {route.period}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 时间线筛选 */}
            <TimelineFilter onFilterChange={handleFilterChange} />

            {/* 时间线视图 */}
            <TimelineView
              onYearSelect={handleYearSelect}
              selectedYear={selectedYear}
            />

            {/* 生平大事记 */}
            <LifeEvents onEventClick={handleYearSelect} />
          </div>
        </ScrollArea>
      </div>

      {/* 展开侧边栏按钮 */}
      {!showSidebar && (
        <Button
          className="absolute top-4 left-4 z-10"
          onClick={() => setShowSidebar(true)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          探索
        </Button>
      )}

      {/* 旅程详情弹窗 */}
      {selectedJourney && (
        <div className="absolute top-20 right-4 w-96 bg-card border shadow-lg rounded-lg z-50 max-h-[500px] overflow-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-1">
                  {selectedJourney.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedJourney.period}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedJourney.yearRange}
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedJourney(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 故事描述 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedJourney.story}
              </p>
            </div>

            {/* 旅程路线 */}
            <div className="pt-3 border-t">
              <p className="text-xs font-medium mb-2">🗺️ 旅程路线</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                {selectedJourney.waypoints.map((wp, idx) => (
                  <React.Fragment key={idx}>
                    <span>{wp.name}</span>
                    {idx < selectedJourney.waypoints.length - 1 && (
                      <span className="text-primary">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 相关诗词列表 */}
            {selectedJourney.poetries && selectedJourney.poetries.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">
                  📖 此期间创作 ({selectedJourney.poetries.length}首)
                </p>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {selectedJourney.poetries.map((poetry) => (
                    <button
                      key={poetry.id}
                      className="block w-full text-left text-sm p-2 hover:bg-slate-100 rounded transition-colors"
                      onClick={() => {
                        const localPoetry = getLocalPoetry(poetry.id);
                        if (localPoetry) {
                          setSelectedPoetry(localPoetry);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{poetry.title}</span>
                        {poetry.year && (
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {poetry.year}年
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 起点信息 */}
            <div className="pt-3 border-t">
              <p className="text-xs font-medium mb-2">📍 起点</p>
              <p className="text-sm text-muted-foreground">
                {selectedJourney.waypoints[0]?.name}
                {selectedJourney.waypoints[0]?.event && (
                  <span> - {selectedJourney.waypoints[0].event}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 诗词详情弹窗 */}
      {selectedPoetry && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedPoetry(null)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPoetry.title}</h2>
                  <p className="text-muted-foreground">
                    {selectedPoetry.dynasty} · {selectedPoetry.author}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => setShowPoetryShare(true)}>
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedPoetry(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedPoetry.genre && (
                  <Badge variant="secondary">{selectedPoetry.genre}</Badge>
                )}
                {selectedPoetry.year && (
                  <Badge variant="outline">{selectedPoetry.year}年</Badge>
                )}
                {selectedPoetry.period && (
                  <Badge variant="outline">{selectedPoetry.period}</Badge>
                )}
              </div>

              {/* 诗词正文 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <div
                  className="text-center font-serif text-lg leading-loose"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {selectedPoetry.content}
                </div>
              </div>

              {/* 创作背景 */}
              {selectedPoetry.background && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">创作背景</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedPoetry.background}
                  </p>
                </div>
              )}

              {/* 标签 */}
              {selectedPoetry.tags && selectedPoetry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-4 border-t">
                  {selectedPoetry.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 分享卡片弹窗 */}
      {selectedPoetry && (
        <ShareModal
          poetry={{
            id: selectedPoetry.id,
            title: selectedPoetry.title,
            content: selectedPoetry.content,
            dynasty: selectedPoetry.dynasty,
            author: selectedPoetry.author,
            year: selectedPoetry.year ?? null,
            period: selectedPoetry.period ?? null,
            genre: selectedPoetry.genre ?? null,
            tags: selectedPoetry.tags?.join(',') ?? null,
            background: selectedPoetry.background ?? null,
            annotations: selectedPoetry.annotations ?? null,
            translations: selectedPoetry.translations ?? null,
            year_range: null,
            created_at: '',
            updated_at: null,
          }}
          open={showPoetryShare}
          onClose={() => setShowPoetryShare(false)}
        />
      )}

      {/* 地点详情弹窗 */}
      {selectedLocation && !selectedJourney && (
        <div className="absolute top-20 right-4 w-80 bg-card border shadow-lg rounded-lg z-50 max-h-[400px] overflow-auto">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedLocation.ancient_name || selectedLocation.name}
                </h3>
                {selectedLocation.ancient_name && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.name}
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  console.log('[ExplorePage] 关闭弹窗');
                  setSelectedLocation(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedLocation.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {selectedLocation.description}
              </p>
            )}

            {selectedLocation.attraction_info && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium mb-1">📍 现今景点</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedLocation.attraction_info}
                </p>
              </div>
            )}

            {/* 相关诗词列表 */}
            {locationPoetries && locationPoetries.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium mb-2">
                  📖 相关诗词 ({locationPoetries.length}首)
                </p>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {locationPoetries.map((poetry) => (
                    <button
                      key={poetry.id}
                      className="block w-full text-left text-sm p-2 hover:bg-slate-100 rounded transition-colors"
                      onClick={() => navigate(`/poetry/${poetry.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{poetry.title}</span>
                        {poetry.genre && (
                          <Badge variant="outline" className="text-xs ml-2 shrink-0">
                            {poetry.genre}
                          </Badge>
                        )}
                      </div>
                      {poetry.year && (
                        <span className="text-xs text-muted-foreground">
                          {poetry.year}年
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (locationPoetries && locationPoetries.length > 0) {
                    navigate(`/poetry/${locationPoetries[0].id}`);
                  }
                }}
                disabled={!locationPoetries || locationPoetries.length === 0}
              >
                查看诗词
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                导航
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 底部统计 */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card/90 backdrop-blur border shadow-lg rounded-lg p-4 z-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {filteredLocations.length}
            </p>
            <p className="text-xs text-muted-foreground">足迹地点</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {poetriesData?.total || 0}
            </p>
            <p className="text-xs text-muted-foreground">收录诗词</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {selectedYear ? selectedYear : '全部'}
            </p>
            <p className="text-xs text-muted-foreground">年份筛选</p>
          </div>
        </div>
      </div>
    </div>
  );
}
