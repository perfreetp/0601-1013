import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Send,
  Download,
  Plus,
  X,
} from 'lucide-react';
import VideoPlayer from '@/components/features/VideoPlayer';
import EditorTimeline from '@/components/features/EditorTimeline';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useEditorStore } from '@/store/useEditorStore';
import { useMaterialStore } from '@/store/useMaterialStore';
import {
  STICKER_TYPES,
  VIDEO_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_COLORS,
} from '@/utils/constants';
import { cn, formatDuration } from '@/utils/format';
import type { Material, Sticker, MaterialType, VideoStatus } from '@/types';

const DEFAULT_COVER = 'https://picsum.photos/seed/editor-cover/400/225';

export default function Editor() {
  const { materials } = useMaterialStore();
  const {
    currentProject,
    stickers,
    currentTime,
    duration,
    coverImage,
    addSticker,
    removeSticker,
    updateSticker,
    setTitle,
    setCover,
  } = useEditorStore();

  const [videoMaterials, setVideoMaterials] = useState<Material[]>([]);
  const [draggedSticker, setDraggedSticker] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | MaterialType>('all');

  const filteredMaterials = activeTab === 'all'
    ? materials
    : materials.filter((m) => m.type === activeTab);

  useEffect(() => {
    setVideoMaterials(materials.filter((m) => m.type === 'video'));
  }, [materials]);

  const projectTitle = currentProject?.title || '未命名视频项目';
  const projectStatus: VideoStatus = currentProject?.status || 'draft';

  const handleAddSticker = useCallback(
    (emoji: string) => {
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: emoji,
        x: 50,
        y: 50,
        scale: 1,
        startTime: currentTime,
        endTime: Math.min(currentTime + 5, duration || 60),
      };
      addSticker(newSticker);
    },
    [addSticker, currentTime, duration]
  );

  const handleStickerMouseDown = useCallback(
    (e: React.MouseEvent, sticker: Sticker) => {
      e.preventDefault();
      e.stopPropagation();
      if (!previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const stickerX = (sticker.x / 100) * rect.width;
      const stickerY = (sticker.y / 100) * rect.height;
      setDragOffset({
        x: e.clientX - rect.left - stickerX,
        y: e.clientY - rect.top - stickerY,
      });
      setDraggedSticker(sticker.id);
    },
    []
  );

  useEffect(() => {
    if (!draggedSticker) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
      updateSticker(draggedSticker, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const handleMouseUp = () => {
      setDraggedSticker(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSticker, dragOffset, updateSticker]);

  const handlePickFrame = useCallback(() => {
    console.log('Picking frame from video at', currentTime);
    setCover(coverImage || DEFAULT_COVER);
  }, [currentTime, setCover, coverImage]);

  const handleUploadCover = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCoverFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setCover(url);
        e.target.value = '';
      }
    },
    [setCover]
  );

  const handleSubmitReview = useCallback(() => {
    alert('已提交审核！');
  }, []);

  const handleExport = useCallback(() => {
    console.log('Exporting video...');
    alert('正在导出视频...');
  }, []);

  const visibleStickers = stickers.filter(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  const materialTabs: { value: 'all' | MaterialType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'video', label: MATERIAL_TYPE_LABELS.video },
    { value: 'image', label: MATERIAL_TYPE_LABELS.image },
    { value: 'subtitle', label: MATERIAL_TYPE_LABELS.subtitle },
    { value: 'music', label: MATERIAL_TYPE_LABELS.music },
  ];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="section-title">视频剪辑</h1>
            <p className="section-subtitle">拖拽素材到时间轴，自由创作精彩视频</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
              导出视频
            </Button>
            <Button size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSubmitReview}>
              提交审核
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          <div className="w-full lg:w-72 shrink-0 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">素材库</CardTitle>
                <Button variant="primary" size="sm" icon={<Upload className="w-3.5 h-3.5" />}>
                  上传
                </Button>
              </CardHeader>
              <div className="px-4 pb-2 border-b border-neutral-100">
                <div className="flex gap-1 overflow-x-auto">
                  {materialTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                        activeTab === tab.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-500 hover:bg-neutral-100'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredMaterials.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">暂无素材</p>
                  </div>
                ) : (
                  filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="group relative rounded-xl overflow-hidden border border-neutral-100 bg-white cursor-grab active:cursor-grabbing transition-all hover:shadow-card hover:-translate-y-0.5"
                      draggable
                    >
                      <div className="relative aspect-video bg-neutral-100">
                        {material.cover ? (
                          <img
                            src={material.cover}
                            alt={material.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center',
                                MATERIAL_TYPE_COLORS[material.type]
                              )}
                            >
                              {material.type === 'video' && <Video className="w-5 h-5" />}
                              {material.type === 'image' && <ImageIcon className="w-5 h-5" />}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
                              MATERIAL_TYPE_COLORS[material.type]
                            )}
                          >
                            {MATERIAL_TYPE_LABELS[material.type]}
                          </span>
                        </div>
                        {(material.type === 'video' || material.type === 'music') && material.duration && (
                          <div className="absolute bottom-1.5 right-1.5">
                            <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                              {formatDuration(material.duration)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium text-neutral-800 truncate">{material.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <Card className="shrink-0">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input text-base font-semibold"
                      placeholder="输入视频标题..."
                    />
                  </div>
                  <Badge
                    variant={projectStatus === 'approved' ? 'success' : projectStatus === 'reviewing' ? 'warning' : projectStatus === 'published' ? 'primary' : 'default'}
                    className={cn('h-9 px-3 text-sm')}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        projectStatus === 'draft' && 'bg-neutral-400',
                        projectStatus === 'reviewing' && 'bg-warning-500',
                        projectStatus === 'approved' && 'bg-success-500',
                        projectStatus === 'published' && 'bg-primary-500',
                        projectStatus === 'offline' && 'bg-danger-500'
                      )}
                    />
                    {VIDEO_STATUS_LABELS[projectStatus]}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-h-0 flex flex-col">
              <CardContent className="flex-1 p-4 flex flex-col gap-4 min-h-0">
                <div ref={previewRef} className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shrink-0">
                  <VideoPlayer
                    poster={videoMaterials[0]?.cover || DEFAULT_COVER}
                    duration={duration || 60}
                  />
                  {visibleStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      onMouseDown={(e) => handleStickerMouseDown(e, sticker)}
                      className={cn(
                        'absolute cursor-grab active:cursor-grabbing select-none group',
                        draggedSticker === sticker.id && 'z-20'
                      )}
                      style={{
                        left: `${sticker.x}%`,
                        top: `${sticker.y}%`,
                        transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                        fontSize: `${24 + sticker.scale * 16}px`,
                      }}
                    >
                      <span className="drop-shadow-lg inline-block">{sticker.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSticker(sticker.id);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-3">视频封面</h4>
                    <div className="flex items-start gap-3">
                      <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                        {coverImage ? (
                          <img src={coverImage} alt="封面" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" icon={<Video className="w-3.5 h-3.5" />} onClick={handlePickFrame}>
                          从视频帧选取
                        </Button>
                        <Button variant="outline" size="sm" icon={<Upload className="w-3.5 h-3.5" />} onClick={handleUploadCover}>
                          上传封面
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-3">贴纸</h4>
                    <div className="grid grid-cols-10 gap-1.5">
                      {STICKER_TYPES.map((emoji, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddSticker(emoji)}
                          className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center text-lg hover:bg-primary-50 hover:border-primary-200 hover:scale-110 transition-all shadow-sm"
                          title={`添加贴纸 ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shrink-0">
              <CardContent className="p-4">
                <EditorTimeline
                  totalDuration={duration || 60}
                  currentTime={currentTime}
                />
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
