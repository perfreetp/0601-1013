import { create } from 'zustand';
import type { Schedule, ScheduleStatus } from '@/types';
import { schedules } from '@/mock/schedule';

interface ScheduleState {
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  togglePin: (id: string) => void;
  updateStatus: (id: string, status: ScheduleStatus) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules,
  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [schedule, ...state.schedules],
    })),
  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),
  togglePin: (id) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s)),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, status } : s)),
    })),
}));
