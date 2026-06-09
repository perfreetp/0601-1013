import { useState, useMemo, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useReviewStore } from '@/store/useReviewStore';
import { cn, formatDate } from '@/utils/format';
import type { Schedule, ScheduleStatus } from '@/types';

const videoTitles: Record<string, string> = {
  v001: '2024秋季招新宣传视频',
  v002: '社团活动精彩回顾',
  v003: '迎新晚会宣传视频',
  v004: '部门招新介绍合集',
  v005: '学长学姐经验分享',
  v006: '校园生活vlog',
};

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

const toLocalInput = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromLocalInput = (localStr: string) => {
  if (!localStr) return '';
  return localStr.replace('T', ' ') + ':00';
};

type FormData = {
  title: string;
  videoId: string;
  publishAt: string;
  offlineAt: string;
  isPinned: boolean;
  status: ScheduleStatus;
};

const emptyFormData: FormData = {
  title: '',
  videoId: '',
  publishAt: '',
  offlineAt: '',
  isPinned: false,
  status: 'pending',
};

export default function Schedule() {
  const { schedules, addSchedule, updateSchedule, togglePin, updateStatus, deleteSchedule } =
    useScheduleStore();
  const { reviews } = useReviewStore();
  const [activeStatus, setActiveStatus] = useState<ScheduleStatus>('pending');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  useEffect(() => {
    const pending = localStorage.getItem('pending-schedule');
    localStorage.removeItem('pending-schedule');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        if (data.ts && Date.now() - data.ts > 30000) return;
        if (data.videoId || data.title) {
          setFormData({
            ...emptyFormData,
            videoId: data.videoId || '',
            title: data.title || '',
          });
          setEditingSchedule(null);
          setShowModal(true);
        }
      } catch (e) {
        console.error('Failed to parse pending schedule', e);
      }
    }
  }, []);

  const approvedReviews = useMemo(() => {
    return reviews.filter((r) => r.status === 'approved');
  }, [reviews]);

  const getReviewStatus = (videoId: string) => {
    const review = reviews.find((r) => r.videoId === videoId);
    return review?.status;
  };

  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.status === activeStatus)
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
      });
  }, [schedules, activeStatus]);

  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return schedules.filter((s) => s.publishAt.startsWith(dateStr));
  }, [schedules, selectedDate]);

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDragStart = (e: React.DragEvent, scheduleId: string) => {
    e.dataTransfer.setData('scheduleId', scheduleId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    const scheduleId = e.dataTransfer.getData('scheduleId');
    if (!scheduleId) return;

    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const pad = (n: number) => String(n).padStart(2, '0');
    const newPublishAt = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 09:00:00`;

    updateSchedule(scheduleId, { publishAt: newPublishAt });
    showToast(`已将「${schedule.title}」移至 ${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
  };

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

  const handleOpenCreate = () => {
    setFormData(emptyFormData);
    setEditingSchedule(null);
    setShowModal(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setFormData({
      title: schedule.title,
      videoId: schedule.videoId,
      publishAt: toLocalInput(schedule.publishAt),
      offlineAt: toLocalInput(schedule.offlineAt),
      isPinned: schedule.isPinned,
      status: schedule.status,
    });
    setEditingSchedule(schedule);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setFormData(emptyFormData);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showToast('请输入排期标题');
      return;
    }
    if (!formData.videoId.trim()) {
      showToast('请输入视频 ID');
      return;
    }
    if (!formData.publishAt) {
      showToast('请选择发布时间');
      return;
    }
    if (formData.offlineAt && new Date(formData.offlineAt) < new Date(formData.publishAt)) {
      showToast('下架时间不能早于发布时间');
      return;
    }
    if (formData.status === 'published' && getReviewStatus(formData.videoId) !== 'approved') {
      showToast('该视频尚未通过审核，无法发布');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      videoId: formData.videoId.trim(),
      publishAt: fromLocalInput(formData.publishAt),
      offlineAt: formData.offlineAt ? fromLocalInput(formData.offlineAt) : undefined,
      isPinned: formData.isPinned,
      status: formData.status,
    };

    if (editingSchedule) {
      updateSchedule(editingSchedule.id, payload);
      showToast(`已更新「${payload.title}」`);
    } else {
      addSchedule(payload);
      showToast(`已创建「${payload.title}」`);
    }
    handleCloseModal();
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
        <Button variant="accent" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
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
              filteredSchedules.map((schedule) => {
                const reviewStatus = getReviewStatus(schedule.videoId);
                const isReviewApproved = reviewStatus === 'approved';
                return (
                  <Card
                    key={schedule.id}
                    hover
                    draggable
                    onDragStart={(e) => handleDragStart(e, schedule.id)}
                    className={cn(
                      'p-4 transition-all duration-300 cursor-grab active:cursor-grabbing',
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-neutral-800 truncate">{schedule.title}</h3>
                          <Badge variant={statusConfig[schedule.status].variant}>
                            <span
                              className={cn('w-1.5 h-1.5 rounded-full', statusConfig[schedule.status].dotColor)}
                            />
                            {statusConfig[schedule.status].label}
                          </Badge>
                          {!isReviewApproved && (
                            <Badge variant="danger">
                              <AlertCircle className="w-3 h-3" />
                              审核未通过
                            </Badge>
                          )}
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
                          onClick={() => handleOpenEdit(schedule)}
                        />
                        {schedule.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<UploadCloud className="w-4 h-4" />}
                            onClick={() => handleUpdateStatus(schedule.id, schedule.title, 'published')}
                            disabled={!isReviewApproved}
                            title={!isReviewApproved ? '该视频尚未通过审核' : ''}
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
                );
              })
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
                const isSelected = selectedDate && isSameDate(date, selectedDate);
                const isDragOver = dragOverDate && isSameDate(date, dragOverDate);
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    onDragOver={(e) => handleDragOver(e, date)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                    className={cn(
                      'relative aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                      today && !isDragOver && !isSelected && 'bg-primary-500 text-white shadow-md',
                      !today && hasSchedule && !isDragOver && !isSelected && 'bg-primary-50 text-primary-700',
                      !today && !hasSchedule && !isDragOver && !isSelected && 'text-neutral-600 hover:bg-neutral-50',
                      isSelected && !isDragOver && 'ring-2 ring-primary-500 bg-primary-100 text-primary-700',
                      isDragOver && 'bg-primary-200 text-primary-800 ring-2 ring-primary-400 scale-105'
                    )}
                  >
                    {date.getDate()}
                    {hasSchedule && !today && !isDragOver && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                    {hasSchedule && today && !isDragOver && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                );
              })}
            </div>
            {selectedDate && (
              <div className="mt-5 pt-5 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-800">
                    {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 排期
                  </h4>
                  <span className="text-xs text-neutral-500">{selectedDateSchedules.length} 条</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDateSchedules.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2 text-center">暂无排期</p>
                  ) : (
                    selectedDateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-neutral-50"
                      >
                        <span className="text-xs text-neutral-700 truncate flex-1">{schedule.title}</span>
                        <Badge variant={statusConfig[schedule.status].variant} className="px-2 py-0.5 text-[10px]">
                          {statusConfig[schedule.status].label}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

      <Modal open={showModal} onClose={handleCloseModal} title={editingSchedule ? '编辑排期' : '新建排期'}>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                排期标题 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入排期标题"
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                视频 <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.videoId}
                onChange={(e) => {
                  const videoId = e.target.value;
                  const title = videoTitles[videoId] || '';
                  setFormData({ ...formData, videoId, title: formData.title || title });
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
              >
                <option value="">请选择视频</option>
                {reviews.map((review) => (
                  <option key={review.id} value={review.videoId}>
                    {review.videoId} - {videoTitles[review.videoId] || '未知视频'}
                    {review.status !== 'approved' && ' (未审核通过)'}
                  </option>
                ))}
              </select>
              {reviews.length === 0 && (
                <p className="mt-1.5 text-xs text-warning-600">暂无可选择的视频，请先在审核页提交审核</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                发布时间 <span className="text-danger-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.publishAt}
                onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">下架时间（可选）</label>
              <input
                type="datetime-local"
                value={formData.offlineAt}
                onChange={(e) => setFormData({ ...formData, offlineAt: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ScheduleStatus })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
              >
                <option value="pending">待发布</option>
                <option value="published">已发布</option>
                <option value="offline">已下架</option>
              </select>
              {formData.videoId && getReviewStatus(formData.videoId) !== 'approved' && (
                <p className="mt-1.5 text-xs text-danger-500">该视频暂未通过审核</p>
              )}
            </div>

            <div className="pt-1">
              <Switch
                checked={formData.isPinned}
                onChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                label="置顶排期"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave}>
            保存
          </Button>
        </ModalFooter>
      </Modal>

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
