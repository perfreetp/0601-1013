import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Film, Music2, GripVertical } from 'lucide-react';
import { cn, formatDuration } from '@/utils/format';
import type { Clip } from '@/types';

export interface TimelineClip extends Clip {
  color: string;
  name?: string;
}

interface TrackConfig {
  id: number;
  type: 'video' | 'audio';
  label: string;
  icon: typeof Film;
  color: string;
}

interface EditorTimelineProps {
  clips?: TimelineClip[];
  totalDuration?: number;
  currentTime?: number;
  zoom?: number;
  onTimeChange?: (time: number) => void;
  onClipChange?: (clip: TimelineClip) => void;
  onZoomChange?: (zoom: number) => void;
  onDropMaterial?: (materialId: string, startTime: number, track: number) => void;
  className?: string;
}

const DEFAULT_TRACKS: TrackConfig[] = [
  { id: 0, type: 'video', label: '视频轨', icon: Film, color: 'primary' },
  { id: 1, type: 'video', label: '视频轨 2', icon: Film, color: 'accent' },
  { id: 2, type: 'audio', label: '音轨', icon: Music2, color: 'success' },
];

const CLIP_COLORS = [
  'bg-gradient-to-r from-primary-500 to-primary-400',
  'bg-gradient-to-r from-accent-500 to-accent-400',
  'bg-gradient-to-r from-success-500 to-success-400',
  'bg-gradient-to-r from-purple-500 to-purple-400',
  'bg-gradient-to-r from-pink-500 to-pink-400',
  'bg-gradient-to-r from-cyan-500 to-cyan-400',
];

const PIXELS_PER_SECOND_BASE = 20;
const TRACK_HEIGHT = 72;
const TRACK_HEADER_WIDTH = 120;
const TIMELINE_HEIGHT = 48;

export default function EditorTimeline({
  clips: externalClips,
  totalDuration = 120,
  currentTime: externalTime,
  zoom: externalZoom = 1,
  onTimeChange,
  onClipChange,
  onZoomChange,
  onDropMaterial,
  className,
}: EditorTimelineProps) {
  const [internalTime, setInternalTime] = useState(0);
  const [internalZoom, setInternalZoom] = useState(1);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggingClip, setDraggingClip] = useState<string | null>(null);
  const [resizingClip, setResizingClip] = useState<{ id: string; edge: 'left' | 'right' } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; clipStartTime: number; clipEndTime: number; cursorTime: number; clipTrack: number } | null>(null);

  const currentTime = externalTime ?? internalTime;
  const zoom = externalZoom ?? internalZoom;
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

  const clips = externalClips ?? [];

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.25, 5);
    if (externalZoom === undefined) setInternalZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, externalZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.25, 0.25);
    if (externalZoom === undefined) setInternalZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, externalZoom, onZoomChange]);

  const getTimeFromClientX = useCallback(
    (clientX: number): number => {
      if (!timelineRef.current) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = clientX - rect.left - TRACK_HEADER_WIDTH;
      const time = Math.max(0, Math.min(x / pixelsPerSecond, totalDuration));
      return time;
    },
    [pixelsPerSecond, totalDuration]
  );

  const getTrackFromClientY = useCallback(
    (clientY: number): number => {
      if (!timelineRef.current) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const y = clientY - rect.top - TIMELINE_HEIGHT;
      const trackIndex = Math.floor(y / TRACK_HEIGHT);
      return Math.max(0, Math.min(trackIndex, DEFAULT_TRACKS.length - 1));
    },
    []
  );

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingPlayhead || draggingClip || resizingClip) return;
      const time = getTimeFromClientX(e.clientX);
      if (externalTime === undefined) setInternalTime(time);
      onTimeChange?.(time);
    },
    [getTimeFromClientX, isDraggingPlayhead, draggingClip, resizingClip, externalTime, onTimeChange]
  );

  const handlePlayheadMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  }, []);

  const handleClipMouseDown = useCallback(
    (e: React.MouseEvent, clip: TimelineClip) => {
      e.preventDefault();
      e.stopPropagation();
      const cursorTime = getTimeFromClientX(e.clientX);
      dragStartRef.current = {
        x: e.clientX,
        clipStartTime: clip.startTime,
        clipEndTime: clip.endTime,
        cursorTime,
        clipTrack: clip.track,
      };
      setDraggingClip(clip.id);
    },
    [getTimeFromClientX]
  );

  const handleClipResizeStart = useCallback(
    (e: React.MouseEvent, clip: TimelineClip, edge: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      const cursorTime = getTimeFromClientX(e.clientX);
      dragStartRef.current = {
        x: e.clientX,
        clipStartTime: clip.startTime,
        clipEndTime: clip.endTime,
        cursorTime,
        clipTrack: clip.track,
      };
      setResizingClip({ id: clip.id, edge });
    },
    [getTimeFromClientX]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const materialId = e.dataTransfer.getData('materialId');
      if (!materialId) return;
      const startTime = getTimeFromClientX(e.clientX);
      const track = getTrackFromClientY(e.clientY);
      onDropMaterial?.(materialId, startTime, track);
    },
    [getTimeFromClientX, getTrackFromClientY, onDropMaterial]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead) {
        const time = getTimeFromClientX(e.clientX);
        if (externalTime === undefined) setInternalTime(time);
        onTimeChange?.(time);
      }

      if ((draggingClip || resizingClip) && dragStartRef.current) {
        const currentCursorTime = getTimeFromClientX(e.clientX);
        const deltaTime = currentCursorTime - dragStartRef.current.cursorTime;
        const currentTrack = getTrackFromClientY(e.clientY);

        const targetId = draggingClip || resizingClip?.id;
        if (!targetId) return;

        const targetClip = clips.find((c) => c.id === targetId);
        if (!targetClip) return;

        let updatedClip: TimelineClip = { ...targetClip };

        if (draggingClip) {
          const newStart = Math.max(0, dragStartRef.current.clipStartTime + deltaTime);
          const duration = dragStartRef.current.clipEndTime - dragStartRef.current.clipStartTime;
          const newEnd = Math.min(newStart + duration, totalDuration);
          const adjustedStart = newEnd - duration;
          updatedClip = {
            ...targetClip,
            startTime: adjustedStart,
            endTime: newEnd,
            track: currentTrack,
          };
        }

        if (resizingClip?.edge === 'left') {
          const newStart = Math.max(0, Math.min(dragStartRef.current.clipStartTime + deltaTime, targetClip.endTime - 0.5));
          updatedClip = { ...targetClip, startTime: newStart };
        }

        if (resizingClip?.edge === 'right') {
          const newEnd = Math.min(totalDuration, Math.max(dragStartRef.current.clipEndTime + deltaTime, targetClip.startTime + 0.5));
          updatedClip = { ...targetClip, endTime: newEnd };
        }

        onClipChange?.(updatedClip);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingPlayhead) setIsDraggingPlayhead(false);
      if (draggingClip) setDraggingClip(null);
      if (resizingClip) setResizingClip(null);
      dragStartRef.current = null;
    };

    if (isDraggingPlayhead || draggingClip || resizingClip) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, draggingClip, resizingClip, getTimeFromClientX, getTrackFromClientY, externalTime, onTimeChange, clips, onClipChange, totalDuration]);

  const timeMarkers = [];
  const markerInterval = zoom > 2 ? 1 : zoom > 1 ? 5 : 10;
  for (let t = 0; t <= totalDuration; t += markerInterval) {
    timeMarkers.push(t);
  }

  return (
    <div className={cn('w-full rounded-2xl bg-neutral-900 overflow-hidden shadow-card', className)}>
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white">时间轴</span>
          <span className="text-xs text-neutral-400">总时长: {formatDuration(totalDuration)}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-mono">
            {formatDuration(currentTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white flex items-center justify-center transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-32 h-2 rounded-full bg-neutral-700 relative">
            <div
              className="absolute h-full rounded-full bg-gradient-primary"
              style={{ width: `${((zoom - 0.25) / 4.75) * 100}%` }}
            />
            <input
              type="range"
              min="0.25"
              max="5"
              step="0.05"
              value={zoom}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (externalZoom === undefined) setInternalZoom(v);
                onZoomChange?.(v);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white flex items-center justify-center transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={timelineRef}
        className={cn(
          'relative overflow-x-auto overflow-y-hidden',
          isDragOver && 'ring-2 ring-inset ring-primary-500'
        )}
        onClick={handleTimelineClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={{ width: TRACK_HEADER_WIDTH + totalDuration * pixelsPerSecond, minWidth: '100%' }}>
          <div className="flex h-12 border-b border-neutral-700 sticky top-0 bg-neutral-800">
            <div className="w-[120px] shrink-0" />
            <div className="relative flex-1">
              {timeMarkers.map((t) => (
                <div
                  key={t}
                  className="absolute top-0 h-full flex flex-col items-start cursor-pointer"
                  style={{ left: t * pixelsPerSecond }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (externalTime === undefined) setInternalTime(t);
                    onTimeChange?.(t);
                  }}
                >
                  <div className="w-px h-2 bg-neutral-600 mt-3" />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1">
                    {formatDuration(t)}
                  </span>
                </div>
              ))}
              {Array.from({ length: Math.floor(totalDuration * 2) }).map((_, i) => {
                const halfT = (i + 1) * 0.5;
                if (timeMarkers.includes(halfT)) return null;
                return (
                  <div
                    key={`half-${i}`}
                    className="absolute top-0 w-px h-1.5 bg-neutral-700"
                    style={{ left: halfT * pixelsPerSecond, top: '14px' }}
                  />
                );
              })}
            </div>
          </div>

          {DEFAULT_TRACKS.map((track) => (
            <div key={track.id} className="flex border-b border-neutral-800 last:border-b-0" style={{ height: TRACK_HEIGHT }}>
              <div className="w-[120px] shrink-0 flex items-center gap-2 px-4 bg-neutral-800/50 border-r border-neutral-700">
                <track.icon className={cn('w-4 h-4', track.color === 'primary' && 'text-primary-400', track.color === 'accent' && 'text-accent-400', track.color === 'success' && 'text-success-400')} />
                <span className="text-xs text-neutral-400 font-medium">{track.label}</span>
              </div>
              <div className="relative flex-1 bg-neutral-850" style={{ backgroundColor: '#1a2234' }}>
                {timeMarkers.map((t) => (
                  <div
                    key={`grid-${track.id}-${t}`}
                    className="absolute top-0 bottom-0 w-px bg-neutral-700/30"
                    style={{ left: t * pixelsPerSecond }}
                  />
                ))}

                {clips
                  .filter((clip) => clip.track === track.id)
                  .map((clip) => (
                    <div
                      key={clip.id}
                      onMouseDown={(e) => handleClipMouseDown(e, clip)}
                      className={cn(
                        'absolute top-2 bottom-2 rounded-lg cursor-grab active:cursor-grabbing overflow-hidden group',
                        clip.color,
                        draggingClip === clip.id && 'ring-2 ring-white/50 z-10',
                        resizingClip?.id === clip.id && 'ring-2 ring-white/50 z-10'
                      )}
                      style={{
                        left: clip.startTime * pixelsPerSecond,
                        width: (clip.endTime - clip.startTime) * pixelsPerSecond,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div
                        onMouseDown={(e) => handleClipResizeStart(e, clip, 'left')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GripVertical className="w-3 h-3 text-white/70" />
                      </div>

                      <div className="h-full px-3 py-2 flex flex-col justify-center">
                        <p className="text-xs font-medium text-white truncate">{clip.name || `片段 ${clip.id}`}</p>
                        <p className="text-[10px] text-white/70 font-mono mt-0.5">
                          {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)}
                        </p>
                      </div>

                      <div
                        onMouseDown={(e) => handleClipResizeStart(e, clip, 'right')}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-black/20 hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GripVertical className="w-3 h-3 text-white/70" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: TRACK_HEADER_WIDTH + currentTime * pixelsPerSecond }}
        >
          <div className="relative h-full flex flex-col items-center">
            <div
              onMouseDown={handlePlayheadMouseDown}
              className="w-6 h-5 -ml-3 bg-danger-500 rounded-b-lg cursor-ew-resize pointer-events-auto flex items-center justify-center shadow-lg"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)' }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="w-0.5 flex-1 bg-danger-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
