import { create } from 'zustand';
import type { Review, ReviewRecord } from '@/types';
import { reviews as initialReviews } from '@/mock/reviews';

const STORAGE_KEY = 'club-video-reviews';

const loadReviews = (): Review[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load reviews from localStorage', e);
  }
  return initialReviews;
};

const saveReviews = (reviews: Review[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage', e);
  }
};

interface ReviewState {
  reviews: Review[];
  selectedReviewId: string | null;
  selectReview: (id: string | null) => void;
  approveReview: (id: string, record: Omit<ReviewRecord, 'action'>) => void;
  rejectReview: (id: string, record: Omit<ReviewRecord, 'action'>) => void;
  addComment: (id: string, record: ReviewRecord) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: loadReviews(),
  selectedReviewId: null,
  selectReview: (id) => set({ selectedReviewId: id }),
  approveReview: (id, record) =>
    set((state) => {
      const review = state.reviews.find((r) => r.id === id);
      if (!review || review.status !== 'pending') {
        return state;
      }
      const newReviews = state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'approved' as const, records: [...r.records, { ...record, action: 'approve' as const }] }
          : r
      );
      saveReviews(newReviews);
      return { reviews: newReviews };
    }),
  rejectReview: (id, record) =>
    set((state) => {
      const review = state.reviews.find((r) => r.id === id);
      if (!review || review.status !== 'pending') {
        return state;
      }
      const newReviews = state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected' as const, records: [...r.records, { ...record, action: 'reject' as const }] }
          : r
      );
      saveReviews(newReviews);
      return { reviews: newReviews };
    }),
  addComment: (id, record) =>
    set((state) => {
      const newReviews = state.reviews.map((r) =>
        r.id === id ? { ...r, records: [...r.records, record] } : r
      );
      saveReviews(newReviews);
      return { reviews: newReviews };
    }),
}));
