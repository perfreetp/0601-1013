import { useMemo } from 'react';
import { Play, ThumbsUp, Share2, UserPlus, Trophy, TrendingUp, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import StatCard from '@/components/features/StatCard';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { cn, formatNumber } from '@/utils/format';
import type { DailyData, SourceData, Analytics as AnalyticsType } from '@/types';

const PIE_COLORS = ['#6366F1', '#F97316', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const { analytics, dateRange, setDateRange, getTopVideos } = useAnalyticsStore();

  const aggregatedDaily = useMemo(() => {
    const dayMap = new Map<string, DailyData>();
    analytics.forEach((a) => {
      a.daily.forEach((d) => {
        const existing = dayMap.get(d.date);
        if (existing) {
          existing.views += d.views;
          existing.likes += d.likes;
          existing.shares += d.shares;
          existing.signUpClicks += d.signUpClicks;
        } else {
          dayMap.set(d.date, { ...d });
        }
      });
    });
    return Array.from(dayMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        date: d.date.slice(5),
      }));
  }, [analytics]);

  const totals = useMemo(() => {
    return analytics.reduce(
      (acc, a) => ({
        views: acc.views + a.views,
        likes: acc.likes + a.likes,
        shares: acc.shares + a.shares,
        signUpClicks: acc.signUpClicks + a.signUpClicks,
      }),
      { views: 0, likes: 0, shares: 0, signUpClicks: 0 }
    );
  }, [analytics]);

  const aggregatedSources = useMemo(() => {
    const sourceMap = new Map<string, number>();
    let totalCount = 0;
    analytics.forEach((a) => {
      a.sources.forEach((s) => {
        sourceMap.set(s.source, (sourceMap.get(s.source) || 0) + s.count);
        totalCount += s.count;
      });
    });
    return Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      count,
      percentage: totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
    }));
  }, [analytics]);

  const topVideos = getTopVideos('views', 5);
  const barChartData = analytics.map((a) => ({
    name: a.videoTitle.length > 8 ? a.videoTitle.slice(0, 8) + '...' : a.videoTitle,
    报名点击: a.signUpClicks,
  }));

  const trendData = [
    { title: '播放量', value: totals.views, trend: 12.5, variant: 'primary' as const, icon: Play, data: aggregatedDaily.map((d) => d.views) },
    { title: '点赞数', value: totals.likes, trend: 8.3, variant: 'accent' as const, icon: ThumbsUp, data: aggregatedDaily.map((d) => d.likes) },
    { title: '转发数', value: totals.shares, trend: -2.1, variant: 'success' as const, icon: Share2, data: aggregatedDaily.map((d) => d.shares) },
    { title: '报名点击', value: totals.signUpClicks, trend: 15.7, variant: 'warning' as const, icon: UserPlus, data: aggregatedDaily.map((d) => d.signUpClicks) },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">数据分析</h1>
            <p className="section-subtitle">追踪播放、点赞、转发与报名转化数据</p>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        <div className="grid grid-cols-4 gap-5">
          {trendData.map((item) => {
            const Icon = item.icon;
            return (
              <StatCard
                key={item.title}
                title={
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </span>
                }
                value={item.value}
                trend={item.trend}
                trendLabel="vs 上周"
                data={item.data}
                variant={item.variant}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                趋势数据
              </CardTitle>
              <CardDescription>近 7 天播放量、点赞数、转发数趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aggregatedDaily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sharesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px -8px rgba(15, 23, 42, 0.08)',
                      }}
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      name="播放量"
                      stroke="#6366F1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', stroke: '#6366F1', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      name="点赞数"
                      stroke="#F97316"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', stroke: '#F97316', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      name="转发数"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent-500" />
                报名点击统计
              </CardTitle>
              <CardDescription>各视频报名按钮点击量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#FB923C" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px -8px rgba(15, 23, 42, 0.08)',
                      }}
                      formatter={(value: number) => formatNumber(value)}
                      cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }}
                    />
                    <Bar dataKey="报名点击" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-success-500" />
                留资来源分布
              </CardTitle>
              <CardDescription>校园群、朋友圈、海报扫码等渠道占比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-56 h-56 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregatedSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="source"
                      >
                        {aggregatedSources.map((_: SourceData, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 24px -8px rgba(15, 23, 42, 0.08)',
                        }}
                        formatter={(value: number, name: string) => [formatNumber(value), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {aggregatedSources.map((s, idx) => (
                    <div key={s.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <span className="text-sm text-neutral-700">{s.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-neutral-800">{formatNumber(s.count)}</span>
                        <span className="text-xs text-neutral-400 w-12 text-right">{s.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning-500" />
                TOP 5 视频排行榜
              </CardTitle>
              <CardDescription>按播放量排序的热门视频</CardDescription>
            </CardHeader>
            <CardContent>
              <TopVideoList videos={topVideos} />
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

function DateRangeSelector({
  value,
  onChange,
}: {
  value: '7d' | '30d';
  onChange: (range: '7d' | '30d') => void;
}) {
  const ranges: Array<{ value: '7d' | '30d'; label: string }> = [
    { value: '7d', label: '近 7 天' },
    { value: '30d', label: '近 30 天' },
  ];

  return (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-100">
      <Calendar className="w-4 h-4 text-neutral-500 ml-2" />
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            value === r.value
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function TopVideoList({ videos }: { videos: AnalyticsType[] }) {
  const rankStyles = [
    'bg-gradient-primary text-white',
    'bg-gradient-accent text-white',
    'bg-gradient-to-br from-warning-500 to-warning-400 text-white',
    'bg-neutral-200 text-neutral-600',
    'bg-neutral-200 text-neutral-600',
  ];

  return (
    <div className="space-y-2.5">
      {videos.map((video, idx) => {
        const maxViews = videos[0]?.views || 1;
        const progress = (video.views / maxViews) * 100;
        return (
          <div
            key={video.videoId}
            className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors group"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                rankStyles[idx]
              )}
            >
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{video.videoTitle}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      idx === 0 && 'bg-gradient-primary',
                      idx === 1 && 'bg-gradient-accent',
                      idx === 2 && 'bg-gradient-to-r from-warning-500 to-warning-400',
                      idx > 2 && 'bg-neutral-400'
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-neutral-500">
                    <Play className="w-3 h-3 inline mr-0.5" />
                    {formatNumber(video.views)}
                  </span>
                  <span className="text-neutral-400">
                    <ThumbsUp className="w-3 h-3 inline mr-0.5" />
                    {formatNumber(video.likes)}
                  </span>
                  <span className="text-neutral-400">
                    <UserPlus className="w-3 h-3 inline mr-0.5" />
                    {formatNumber(video.signUpClicks)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
