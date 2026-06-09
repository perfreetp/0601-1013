import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, ShieldAlert, Music, Image, Type, MessageSquare, User, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import VideoPlayer from '@/components/features/VideoPlayer';
import { useReviewStore } from '@/store/useReviewStore';
import { cn, formatDate } from '@/utils/format';
import type { ReviewStatus, SensitiveWord, CopyrightItem, ReviewRecord } from '@/types';

const statusConfig: Record<ReviewStatus, { label: string; variant: 'warning' | 'success' | 'danger'; icon: typeof Clock }> = {
  pending: { label: '待审核', variant: 'warning', icon: Clock },
  approved: { label: '已通过', variant: 'success', icon: Check },
  rejected: { label: '已驳回', variant: 'danger', icon: X },
};

const copyrightStatusConfig = {
  safe: { label: '安全', variant: 'success' as const, dot: 'bg-success-500' },
  warning: { label: '警告', variant: 'warning' as const, dot: 'bg-warning-500' },
  danger: { label: '风险', variant: 'danger' as const, dot: 'bg-danger-500' },
};

const copyrightIconMap = {
  bgm: Music,
  image: Image,
  font: Type,
};

const videoTitles: Record<string, string> = {
  v001: '2024秋季招新宣传视频',
  v002: '社团活动精彩回顾',
  v003: '迎新晚会宣传视频',
  v004: '部门招新介绍合集',
  v005: '学长学姐经验分享',
  v006: '校园生活vlog',
};

const videoSubmitters: Record<string, { name: string; time: string }> = {
  v001: { name: '张编辑', time: '2024-08-28 09:15:00' },
  v002: { name: '王剪辑', time: '2024-08-27 16:30:00' },
  v003: { name: '李策划', time: '2024-08-26 14:20:00' },
  v004: { name: '赵运营', time: '2024-08-25 11:00:00' },
};

const videoCovers: Record<string, string> = {
  v001: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=225&fit=crop',
  v002: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=225&fit=crop',
  v003: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=225&fit=crop',
  v004: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop',
  v005: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=225&fit=crop',
  v006: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=225&fit=crop',
};

type FilterStatus = 'all' | ReviewStatus;

export default function Review() {
  const { reviews, selectedReviewId, selectReview, approveReview, rejectReview } = useReviewStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  useEffect(() => {
    if (selectedReviewId === null && reviews.length > 0) {
      const firstPending = reviews.find((r) => r.status === 'pending');
      if (firstPending) {
        selectReview(firstPending.id);
      } else {
        selectReview(reviews[0].id);
      }
    }
  }, [reviews, selectedReviewId, selectReview]);

  const filteredReviews = reviews.filter((r) => {
    const title = videoTitles[r.videoId] || '';
    const matchKeyword = title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchKeyword && matchStatus;
  });

  const selectedReview = reviews.find((r) => r.id === selectedReviewId);

  const handleApprove = () => {
    if (!selectedReview) return;
    if (selectedReview.status !== 'pending') return;
    const title = videoTitles[selectedReview.videoId] || '未知视频';
    approveReview(selectedReview.id, {
      reviewerId: 'u001',
      reviewerName: '当前用户',
      comment: comment || '内容合规，审核通过',
      timestamp: new Date().toISOString(),
    });
    setComment('');
    showToast(`已通过「${title}」审核`);
  };

  const handleReject = () => {
    if (!selectedReview) return;
    if (selectedReview.status !== 'pending') return;
    const title = videoTitles[selectedReview.videoId] || '未知视频';
    rejectReview(selectedReview.id, {
      reviewerId: 'u001',
      reviewerName: '当前用户',
      comment: comment || '请修改后重新提交',
      timestamp: new Date().toISOString(),
    });
    setComment('');
    showToast(`已驳回「${title}」`);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="section-title">内容审核</h1>
          <p className="section-subtitle">敏感词检测、版权校验与多人会签流程</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          <div className="w-[35%] flex flex-col gap-4 min-h-0">
            <Card className="shrink-0">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="搜索视频标题..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                        filterStatus === status
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {status === 'all' ? '全部' : statusConfig[status].label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {filteredReviews.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-400">
                    <Search className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">暂无匹配的审核项</p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {filteredReviews.map((review) => {
                      const title = videoTitles[review.videoId] || '未知视频';
                      const submitter = videoSubmitters[review.videoId];
                      const cover = videoCovers[review.videoId];
                      const statusCfg = statusConfig[review.status];
                      const StatusIcon = statusCfg.icon;
                      const isSelected = selectedReviewId === review.id;

                      return (
                        <div
                          key={review.id}
                          onClick={() => selectReview(review.id)}
                          className={cn(
                            'p-4 cursor-pointer transition-all duration-200',
                            isSelected
                              ? 'bg-gradient-to-r from-primary-50 to-transparent border-l-4 border-primary-500'
                              : 'hover:bg-neutral-50 border-l-4 border-transparent'
                          )}
                        >
                          <div className="flex gap-3">
                            <div className="relative w-24 h-14 shrink-0 rounded-lg overflow-hidden bg-neutral-200">
                              {cover ? (
                                <img src={cover} alt={title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <VideoPlayerIcon />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-semibold text-neutral-800 truncate">{title}</h3>
                                <Badge variant={statusCfg.variant} className="shrink-0">
                                  <StatusIcon className="w-3 h-3" />
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                <User className="w-3 h-3 inline mr-1" />
                                {submitter?.name || '未知'}
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {formatDate(submitter?.time || '')}
                              </p>
                              {review.sensitiveWords.length > 0 && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3 text-warning-500" />
                                  <span className="text-xs text-warning-600">
                                    {review.sensitiveWords.length} 处敏感词
                                  </span>
                                </div>
                              )}
                            </div>
                            <ChevronRight
                              className={cn(
                                'w-4 h-4 shrink-0 self-center transition-colors',
                                isSelected ? 'text-primary-500' : 'text-neutral-300'
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
            {!selectedReview ? (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">请选择左侧审核项</p>
                  <p className="text-sm mt-1">点击列表查看审核详情</p>
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-80 shrink-0">
                        <VideoPlayer poster={videoCovers[selectedReview.videoId]} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-neutral-800">
                              {videoTitles[selectedReview.videoId] || '未知视频'}
                            </h2>
                            <p className="text-sm text-neutral-500 mt-2">
                              本视频为校园社团招新宣传内容，包含活动亮点、社团文化展示及报名引导。
                            </p>
                          </div>
                          <Badge variant={statusConfig[selectedReview.status].variant}>
                            {statusConfig[selectedReview.status].label}
                          </Badge>
                        </div>
                        <div className="flex gap-6 mt-4 text-sm text-neutral-500">
                          <div>
                            <span className="text-neutral-400">提交者：</span>
                            {videoSubmitters[selectedReview.videoId]?.name || '未知'}
                          </div>
                          <div>
                            <span className="text-neutral-400">提交时间：</span>
                            {formatDate(videoSubmitters[selectedReview.videoId]?.time || '')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <SensitiveWordPanel words={selectedReview.sensitiveWords} />

                <CopyrightPanel items={selectedReview.copyrights} />

                <ReviewRecordsPanel
                  records={selectedReview.records}
                  comment={comment}
                  onCommentChange={setComment}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  disabled={selectedReview.status !== 'pending'}
                />
              </>
            )}
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

function VideoPlayerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  );
}

function SensitiveWordPanel({ words }: { words: SensitiveWord[] }) {
  const hasDanger = words.some((w) => w.level === 'danger');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning-500" />
              敏感词检测
            </CardTitle>
            <CardDescription>自动识别标题、字幕、描述中的敏感词汇</CardDescription>
          </div>
          {words.length === 0 ? (
            <Badge variant="success">
              <Check className="w-3 h-3" />
              安全
            </Badge>
          ) : (
            <Badge variant={hasDanger ? 'danger' : 'warning'}>
              <ShieldAlert className="w-3 h-3" />
              {hasDanger ? '存在风险' : '需要关注'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <div className="py-8 text-center text-neutral-400">
            <Check className="w-10 h-10 mx-auto mb-2 text-success-500" />
            <p className="text-sm">未检测到敏感词</p>
          </div>
        ) : (
          <div className="space-y-2">
            {words.map((word, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all',
                  word.level === 'danger'
                    ? 'bg-danger-50 border-danger-200 hover:border-danger-300'
                    : 'bg-warning-50 border-warning-200 hover:border-warning-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm',
                      word.level === 'danger' ? 'bg-danger-500 text-white' : 'bg-warning-500 text-white'
                    )}
                  >
                    {word.word.charAt(0)}
                  </div>
                  <div>
                    <p className={cn(
                      'font-semibold text-sm',
                      word.level === 'danger' ? 'text-danger-700' : 'text-warning-700'
                    )}>
                      {word.word}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">位置：{word.location}</p>
                  </div>
                </div>
                <Badge variant={word.level === 'danger' ? 'danger' : 'warning'}>
                  {word.level === 'danger' ? '高风险' : '需注意'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CopyrightPanel({ items }: { items: CopyrightItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
          </svg>
          版权校验
        </CardTitle>
        <CardDescription>检测背景音乐、图片素材与字体的版权合规性</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const Icon = copyrightIconMap[item.type];
            const cfg = copyrightStatusConfig[item.status];
            return (
              <div
                key={idx}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:shadow-card',
                  item.status === 'safe' && 'bg-success-50/50 border-success-200',
                  item.status === 'warning' && 'bg-warning-50/50 border-warning-200',
                  item.status === 'danger' && 'bg-danger-50/50 border-danger-200'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      item.status === 'safe' && 'bg-success-500 text-white',
                      item.status === 'warning' && 'bg-warning-500 text-white',
                      item.status === 'danger' && 'bg-danger-500 text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-800">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                      <span className="text-xs text-neutral-500">{cfg.label}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.tip}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewRecordsPanel({
  records,
  comment,
  onCommentChange,
  onApprove,
  onReject,
  disabled,
}: {
  records: ReviewRecord[];
  comment: string;
  onCommentChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-accent-500" />
          多人会签
        </CardTitle>
        <CardDescription>审核流程记录与意见</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length > 0 && (
          <div className="space-y-3 mb-6">
            {records.map((record, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shrink-0">
                  {record.reviewerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-neutral-800">{record.reviewerName}</span>
                    <Badge variant={record.action === 'approve' ? 'success' : 'danger'}>
                      {record.action === 'approve' ? '审核通过' : '驳回'}
                    </Badge>
                    <span className="text-xs text-neutral-400">{formatDate(record.timestamp)}</span>
                  </div>
                  {record.comment && (
                    <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">{record.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <textarea
            placeholder={disabled ? '该审核项已处理，无法添加意见' : '请输入审核意见...'}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            disabled={disabled}
            className="input min-h-[80px] resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-end gap-3">
            {disabled && (
              <span className="text-xs text-neutral-500 mr-auto">该审核项已处理</span>
            )}
            <Button
              variant="danger"
              icon={<X className="w-4 h-4" />}
              onClick={onReject}
              disabled={disabled}
            >
              驳回
            </Button>
            <Button
              variant="primary"
              icon={<Check className="w-4 h-4" />}
              onClick={onApprove}
              disabled={disabled}
            >
              审核通过
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
