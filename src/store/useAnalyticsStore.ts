import { create } from 'zustand';
import type { Analytics } from '@/types';
import { analytics } from '@/mock/analytics';

interface AnalyticsState {
  analytics: Analytics[];
  dateRange: '7d' | '30d';
  setDateRange: (range: '7d' | '30d') => void;
  getTopVideos: (key: 'views' | 'likes' | 'shares' | 'signUpClicks', limit?: number) => Analytics[];
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  analytics,
  dateRange: '7d',
  setDateRange: (range) => set({ dateRange: range }),
  getTopVideos: (key, limit = 5) => {
    const sorted = [...get().analytics].sort((a, b) => b[key] - a[key]);
    return sorted.slice(0, limit);
  },
}));
