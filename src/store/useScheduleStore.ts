import { create } from 'zustand';
import type { Schedule, ScheduleStatus } from '@/types';
import { schedules as defaultSchedules } from '@/mock/schedule';

const STORAGE_KEY = 'club-video-schedules';

function loadFromStorage(): Schedule[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load schedules from localStorage:', e);
  }
  return defaultSchedules;
}

function saveToStorage(schedules: Schedule[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save schedules to localStorage:', e);
  }
}

interface ScheduleState {
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'> & { id?: string }) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  togglePin: (id: string) => void;
  updateStatus: (id: string, status: ScheduleStatus) => void;
}

const initialSchedules = loadFromStorage();

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: initialSchedules,
  addSchedule: (schedule) =>
    set((state) => {
      const newSchedule: Schedule = {
        ...schedule,
        id: schedule.id || `s${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      const newSchedules = [newSchedule, ...state.schedules];
      saveToStorage(newSchedules);
      return { schedules: newSchedules };
    }),
  updateSchedule: (id, updates) =>
    set((state) => {
      const newSchedules = state.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveToStorage(newSchedules);
      return { schedules: newSchedules };
    }),
  deleteSchedule: (id) =>
    set((state) => {
      const newSchedules = state.schedules.filter((s) => s.id !== id);
      saveToStorage(newSchedules);
      return { schedules: newSchedules };
    }),
  togglePin: (id) =>
    set((state) => {
      const newSchedules = state.schedules.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
      saveToStorage(newSchedules);
      return { schedules: newSchedules };
    }),
  updateStatus: (id, status) =>
    set((state) => {
      const newSchedules = state.schedules.map((s) => (s.id === id ? { ...s, status } : s));
      saveToStorage(newSchedules);
      return { schedules: newSchedules };
    }),
}));
