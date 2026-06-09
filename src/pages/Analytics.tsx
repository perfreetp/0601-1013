import { useMemo, useState } from 'react';
import {
  Play,
  ThumbsUp,
  Share2,
  UserPlus,
  Trophy,
  TrendingUp,
  Calendar,
  PlayCircle,
  FolderOpen,
  ClipboardCheck,
  Clock,
  BarChart3,
  Check,
  X,
  FileText,
} from 'lucide-react';
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
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import StatCard from '@/components/features/StatCard';
import { Modal, ModalBody } from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useMaterialStore } from '@/store/useMaterialStore';
import { useReviewStore } from '@/store/useReviewStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { cn, formatNumber, formatDate } from '@/utils/format';
import { MATERIAL_TYPE_LABELS, MATERIAL_TYPE_COLORS, ROLE_LABELS } from '@/utils/constants';
import type { DailyData, SourceData, Analytics as AnalyticsType } from '@/types';

const VIDEO_COVERS: Record<string, string> = {
  v001: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=225&fit=crop',
  v002: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=225&fit=crop',
  v003: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=225&fit=crop',
  v004: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop',
  v005: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=225&fit=crop',
  v006: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=225&fit=crop',
};

const SCHEDULE_STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: '待发布', variant: 'warning' },
  published: { label: '已发布', variant: 'success' },
  offline: { label: '已下线', variant: 'danger' },
};

const PIE_COLORS = ['#6366F1', '#F97316', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const { analytics, dateRange, setDateRange, getTopVideos } = useAnalyticsStore();
  const { materials } = useMaterialStore();
  const { reviews } = useReviewStore();
  const { schedules } = useScheduleStore();
  const [selectedVideo, setSelectedVideo] = useState<AnalyticsType | null>(null);

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
              <TopVideoList videos={topVideos} onVideoClick={setSelectedVideo} />
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-primary-600">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-semibold">发布效果复盘</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">点击上方视频，查看完整发布复盘路径</p>
              </div>
            </CardContent>
          </Card>

          <ReviewModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            materials={materials}
            reviews={reviews}
            schedules={schedules}
          />
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

function TopVideoList({ videos, onVideoClick }: { videos: AnalyticsType[]; onVideoClick: (video: AnalyticsType) => void }) {
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
            onClick={() => onVideoClick(video)}
            className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors group cursor-pointer"
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

function ReviewModal({
  video,
  onClose,
  materials,
  reviews,
  schedules,
}: {
  video: AnalyticsType | null;
  onClose: () => void;
  materials: ReturnType<typeof useMaterialStore.getState>['materials'];
  reviews: ReturnType<typeof useReviewStore.getState>['reviews'];
  schedules: ReturnType<typeof useScheduleStore.getState>['schedules'];
}) {
  if (!video) return null;

  const videoCover = VIDEO_COVERS[video.videoId] || 'https://picsum.photos/seed/' + video.videoId + '/400/225';
  const relatedMaterials = materials.filter((m) => m.videoId === video.videoId);
  const review = reviews.find((r) => r.videoId === video.videoId);
  const schedule = schedules.find((s) => s.videoId === video.videoId);

  const dailyChartData = video.daily.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <Modal open={!!video} onClose={onClose} className="max-w-3xl">
      <ModalBody className="max-h-[85vh] overflow-y-auto p-0">
        <div className="relative h-48 overflow-hidden bg-neutral-900">
          <img src={videoCover} alt={video.videoTitle} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-6 h-6 text-white" />
              <Badge variant="primary" className="bg-white/20 text-white border-0">
                发布复盘
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white">{video.videoTitle}</h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="w-4 h-4 text-primary-500" />
                素材准备
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedMaterials.length > 0 ? (
                <div className="space-y-2">
                  {relatedMaterials.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50">
                      <span className="text-sm text-neutral-700 truncate flex-1 mr-3">{m.name}</span>
                      <Badge variant="default" className={cn('shrink-0', MATERIAL_TYPE_COLORS[m.type])}>
                        {MATERIAL_TYPE_LABELS[m.type]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-neutral-400">暂无关联素材</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="w-4 h-4 text-accent-500" />
                审核会签
              </CardTitle>
            </CardHeader>
            <CardContent>
              {review && review.records.length > 0 ? (
                <div className="space-y-3">
                  {review.records.map((record, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {record.reviewerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-neutral-800">{record.reviewerName}</span>
                          {record.role && (
                            <Badge variant="default" className="text-xs">
                              {ROLE_LABELS[record.role]}
                            </Badge>
                          )}
                          <Badge variant={record.action === 'approve' ? 'success' : 'danger'} className="text-xs">
                            {record.action === 'approve' ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                通过
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <X className="w-3 h-3" />
                                驳回
                              </span>
                            )}
                          </Badge>
                          <span className="text-xs text-neutral-400 ml-auto">{formatDate(record.timestamp)}</span>
                        </div>
                        {record.comment && (
                          <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">{record.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-neutral-400">暂无审核记录</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-warning-500" />
                发布排期
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedule ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50">
                    <span className="text-sm text-neutral-500">发布时间</span>
                    <span className="text-sm font-medium text-neutral-800">{formatDate(schedule.publishAt)}</span>
                  </div>
                  {schedule.offlineAt && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50">
                      <span className="text-sm text-neutral-500">下架时间</span>
                      <span className="text-sm font-medium text-neutral-800">{formatDate(schedule.offlineAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50">
                    <span className="text-sm text-neutral-500">状态</span>
                    <Badge variant={SCHEDULE_STATUS_CONFIG[schedule.status]?.variant || 'default'}>
                      {SCHEDULE_STATUS_CONFIG[schedule.status]?.label || schedule.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-neutral-400">未设置排期</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-4 h-4 text-success-500" />
                数据表现
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-primary-50/50 text-center">
                  <p className="text-xs text-neutral-500 mb-1">播放量</p>
                  <p className="text-lg font-bold text-primary-600">{formatNumber(video.views)}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent-50/50 text-center">
                  <p className="text-xs text-neutral-500 mb-1">点赞数</p>
                  <p className="text-lg font-bold text-accent-600">{formatNumber(video.likes)}</p>
                </div>
                <div className="p-3 rounded-xl bg-success-50/50 text-center">
                  <p className="text-xs text-neutral-500 mb-1">转发数</p>
                  <p className="text-lg font-bold text-success-600">{formatNumber(video.shares)}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning-50/50 text-center">
                  <p className="text-xs text-neutral-500 mb-1">报名点击</p>
                  <p className="text-lg font-bold text-warning-600">{formatNumber(video.signUpClicks)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-3">近 7 天趋势</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.08)',
                        }}
                        formatter={(value: number) => formatNumber(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="播放量"
                        stroke="#6366F1"
                        strokeWidth={2}
                        fill="url(#trendGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModalBody>
    </Modal>
  );
}
