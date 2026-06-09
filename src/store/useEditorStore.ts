import { create } from 'zustand';
import type { Clip, Material, Sticker, VideoProject } from '@/types';

const calculateDuration = (clips: Clip[]): number => {
  if (clips.length === 0) return 60;
  const maxEndTime = Math.max(...clips.map((c) => c.endTime));
  return Math.max(60, maxEndTime);
};

interface EditorState {
  currentProject: VideoProject | null;
  clips: Clip[];
  stickers: Sticker[];
  selectedClipId: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  totalDuration: number;
  coverImage: string | null;
  loadProject: (project: VideoProject) => void;
  addClip: (clip: Clip) => void;
  addClipFromMaterial: (material: Material, startTime?: number, track?: number) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  addSticker: (sticker: Sticker) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setCover: (url: string) => void;
  setTitle: (title: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentProject: null,
  clips: [],
  stickers: [],
  selectedClipId: null,
  playing: false,
  currentTime: 0,
  duration: 60,
  totalDuration: 120,
  coverImage: null,
  loadProject: (project) =>
    set({
      currentProject: project,
      clips: project.clips,
      stickers: project.stickers,
      selectedClipId: null,
      playing: false,
      currentTime: 0,
      duration: calculateDuration(project.clips),
      totalDuration: Math.max(120, ...project.clips.map((c) => c.endTime)),
      coverImage: project.cover,
    }),
  addClip: (clip) =>
    set((state) => {
      const newClips = [...state.clips, clip];
      return {
        clips: newClips,
        duration: calculateDuration(newClips),
        totalDuration: Math.max(state.totalDuration, clip.endTime),
      };
    }),
  addClipFromMaterial: (material, startTime, track) =>
    set((state) => {
      const clipDuration = material.duration ?? 15;
      const actualStartTime =
        startTime ?? (state.clips.length > 0 ? Math.max(...state.clips.map((c) => c.endTime)) : 0);
      const actualTrack = track ?? 0;
      const newClip: Clip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        materialId: material.id,
        startTime: actualStartTime,
        endTime: actualStartTime + clipDuration,
        track: actualTrack,
      };
      const newClips = [...state.clips, newClip];
      return {
        clips: newClips,
        duration: calculateDuration(newClips),
        totalDuration: Math.max(state.totalDuration, newClip.endTime),
      };
    }),
  removeClip: (id) =>
    set((state) => {
      const newClips = state.clips.filter((c) => c.id !== id);
      return {
        clips: newClips,
        selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
        duration: calculateDuration(newClips),
      };
    }),
  updateClip: (id, updates) =>
    set((state) => {
      const newClips = state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c));
      return {
        clips: newClips,
        duration: calculateDuration(newClips),
        totalDuration: Math.max(state.totalDuration, ...newClips.map((c) => c.endTime)),
      };
    }),
  addSticker: (sticker) =>
    set((state) => ({
      stickers: [...state.stickers, sticker],
    })),
  removeSticker: (id) =>
    set((state) => ({
      stickers: state.stickers.filter((s) => s.id !== id),
    })),
  updateSticker: (id, updates) =>
    set((state) => ({
      stickers: state.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  setCurrentTime: (time) =>
    set((state) => ({
      currentTime: typeof time === 'function' ? time(state.currentTime) : time,
    })),
  setPlaying: (playing) => set({ playing }),
  togglePlay: () => set((state) => ({ playing: !state.playing })),
  setCover: (url) => set({ coverImage: url }),
  setTitle: (title) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, title } : null,
    })),
}));
