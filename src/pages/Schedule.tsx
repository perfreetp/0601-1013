import { useState, useMemo } from 'react';
import {
  Plus,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  UploadCloud,
  Archive,
  Calendar,
  Clock,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useScheduleStore } from '@/store/useScheduleStore';
import { cn, formatDate } from '@/utils/format';
import type { ScheduleStatus } from '@/types';

const statusTabs = [
  { value: 'pending', label: '待发布' },
  { value: 'published', label: '已发布' },
  { value: 'offline', label: '已下架' },
];

const statusConfig: Record<
  ScheduleStatus,
  { label: string; variant: 'warning' | 'success' | 'default'; dotColor: string }
> = {
  pending: { label: '待发布', variant: 'warning', dotColor: 'bg-warning-500' },
  published: { label: '已发布', variant: 'success', dotColor: 'bg-success-500' },
  offline: { label: '已下架', variant: 'default', dotColor: 'bg-neutral-400' },
};

export default function Schedule() {
  const { schedules, togglePin, updateStatus, deleteSchedule } = useScheduleStore();
  const [activeStatus, setActiveStatus] = useState<ScheduleStatus>('pending');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.status === activeStatus)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
      });
  }, [schedules, activeStatus]);

  const handleTogglePin = (id: string, title: string) => {
    togglePin(id);
    const schedule = schedules.find((s) => s.id === id);
    showToast(schedule?.isPinned ? `已取消「${title}」置顶` : `已将「${title}」置顶`);
  };

  const handleUpdateStatus = (id: string, title: string, status: ScheduleStatus) => {
    updateStatus(id, status);
    const action = status === 'published' ? '发布' : status === 'offline' ? '下架' : '设为待发布';
    showToast(`已${action}「${title}」`);
  };

  const handleDelete = (id: string, title: string) => {
    deleteSchedule(id);
    showToast(`已删除「${title}」`);
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(), []);

  const hasScheduleOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.some((s) => s.publishAt.startsWith(dateStr));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex flex-col h-full gap-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="section-title">发布排期</h1>
            <p className="section-subtitle">管理内容发布时间，设置置顶与下架策略</p>
          </div>
          <Button variant="accent" icon={<Plus className="w-4 h-4" />}>
            新建排期
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Tabs
              value={activeStatus}
              onChange={(v) => setActiveStatus(v as ScheduleStatus)}
              items={statusTabs}
              className="mb-6"
            />

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {filteredSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                  <Calendar className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">暂无{statusConfig[activeStatus].label}的排期</p>
                </div>
              ) : (
                filteredSchedules.map((schedule) => (
                  <Card
                    key={schedule.id}
                    hover
                    className={cn(
                      'p-4 transition-all duration-300',
                      schedule.isPinned && 'ring-2 ring-warning-200 bg-warning-50/30'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                        <img
                          src={`https://picsum.photos/seed/${schedule.videoId}/160/100`}
                          alt={schedule.title}
                          className="w-full h-full object-cover"
                        />
                        {schedule.isPinned && (
                          <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-warning-500 text-white text-[10px] font-medium">
                            <Pin className="w-3 h-3" />
                            置顶
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-neutral-800 truncate">{schedule.title}</h3>
                          <Badge variant={statusConfig[schedule.status].variant}>
                            <span
                              className={cn('w-1.5 h-1.5 rounded-full', statusConfig[schedule.status].dotColor)}
                            />
                            {statusConfig[schedule.status].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>发布时间: {formatDate(schedule.publishAt)}</span>
                          </div>
                          {schedule.offlineAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>下架时间: {formatDate(schedule.offlineAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={schedule.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          className={cn(schedule.isPinned && 'text-warning-600 hover:text-warning-700')}
                          onClick={() => handleTogglePin(schedule.id, schedule.title)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit3 className="w-4 h-4" />}
                        />
                        {schedule.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<UploadCloud className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(schedule.id, schedule.title, 'published')}
                          >
                            发布
                          </Button>
                        )}
                        {schedule.status === 'published' && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Archive className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(schedule.id, schedule.title, 'offline')}
                          >
                            下架
                          </Button>
                        )}
                        {schedule.status === 'offline' && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<UploadCloud className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(schedule.id, schedule.title, 'pending')}
                          >
                            重新排期
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4 text-danger-500" />}
                          className="hover:bg-danger-50"
                          onClick={() => handleDelete(schedule.id, schedule.title)}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-0">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-neutral-800">近7天排期</h3>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDayNames.map((name) => (
                  <div
                    key={name}
                    className="text-center text-[11px] font-medium text-neutral-400 py-1"
                  >
                    {name}
                  </div>
                ))}
                {weekDays.map((date, idx) => {
                  const hasSchedule = hasScheduleOnDate(date);
                  const today = isToday(date);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200',
                        today && 'bg-primary-500 text-white shadow-md',
                        !today && hasSchedule && 'bg-primary-50 text-primary-700',
                        !today && !hasSchedule && 'text-neutral-600 hover:bg-neutral-50'
                      )}
                    >
                      {date.getDate()}
                      {hasSchedule && !today && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
                      )}
                      {hasSchedule && today && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-5 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                    <span className="text-neutral-600">有排期</span>
                  </div>
                  <span className="font-medium text-neutral-800">
                    {schedules.filter((s) => {
                      const publishDate = new Date(s.publishAt);
                      const today = new Date();
                      const weekLater = new Date();
                      weekLater.setDate(today.getDate() + 7);
                      return publishDate >= today && publishDate <= weekLater;
                    }).length} 条
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                    <span className="text-neutral-600">置顶内容</span>
                  </div>
                  <span className="font-medium text-neutral-800">
                    {schedules.filter((s) => s.isPinned).length} 条
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div
          className={cn(
            'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
            toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
        >
          <div className="bg-neutral-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm">
            {toast.message}
          </div>
        </div>
    </div>
  );
}
