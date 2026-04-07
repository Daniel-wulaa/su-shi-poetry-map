// 苏轼人生诗词地图 - 前端入口
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { ExplorePage } from './pages/ExplorePage';
import { PoetryDetail } from './modules/poetry/PoetryDetail';
import { TimelinePage } from './pages/TimelinePage';
import { QuotesPage } from './pages/QuotesPage';
import { CalligraphyPage } from './pages/CalligraphyPage';
import { ResearchPage } from './pages/ResearchPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分钟
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          {/* 导航栏 */}
          <nav className="border-b bg-card/90 backdrop-blur sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-14">
                <Link to="/" className="font-semibold text-lg">
                  苏轼人生诗词地图
                </Link>
                <div className="flex items-center gap-4">
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                    首页
                  </Link>
                  <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground">
                    探索
                  </Link>
                  <Link to="/research" className="text-sm text-muted-foreground hover:text-foreground">
                    研究
                  </Link>
                  <Link to="/calligraphy" className="text-sm text-muted-foreground hover:text-foreground">
                    书法
                  </Link>
                  <Link to="/quotes" className="text-sm text-muted-foreground hover:text-foreground">
                    名句
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/calligraphy" element={<CalligraphyPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/poetry/:id" element={<PoetryDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
