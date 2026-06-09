import { create } from 'zustand';
import type { Clip, Sticker, VideoProject } from '@/types';

interface EditorState {
  currentProject: VideoProject | null;
  clips: Clip[];
  stickers: Sticker[];
  selectedClipId: string | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  coverImage: string | null;
  loadProject: (project: VideoProject) => void;
  addClip: (clip: Clip) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  addSticker: (sticker: Sticker) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  setCurrentTime: (time: number) => void;
  togglePlay: () => void;
  setCover: (url: string) => void;
  setTitle: (title: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentProject: null,
  clips: [],
  stickers: [],
  selectedClipId: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  coverImage: null,
  loadProject: (project) =>
    set({
      currentProject: project,
      clips: project.clips,
      stickers: project.stickers,
      selectedClipId: null,
      playing: false,
      currentTime: 0,
      coverImage: project.cover,
    }),
  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),
  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),
  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
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
  setCurrentTime: (time) => set({ currentTime: time }),
  togglePlay: () => set((state) => ({ playing: !state.playing })),
  setCover: (url) => set({ coverImage: url }),
  setTitle: (title) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, title } : null,
    })),
}));
