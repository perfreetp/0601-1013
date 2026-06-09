import { create } from 'zustand';
import type { MemberRole, Review, ReviewRecord } from '@/types';
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

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface ReviewState {
  reviews: Review[];
  selectedReviewId: string | null;
  filterStatus: FilterStatus;
  selectReview: (id: string | null) => void;
  setFilterStatus: (status: FilterStatus) => void;
  approveReview: (id: string, record: Omit<ReviewRecord, 'action' | 'role'> & { role?: MemberRole }) => void;
  rejectReview: (id: string, record: Omit<ReviewRecord, 'action' | 'role'> & { role?: MemberRole }) => void;
  addComment: (id: string, record: ReviewRecord) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: loadReviews(),
  selectedReviewId: null,
  filterStatus: 'all',
  selectReview: (id) => set({ selectedReviewId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  approveReview: (id, record) =>
    set((state) => {
      const review = state.reviews.find((r) => r.id === id);
      if (!review || review.status !== 'pending') {
        return state;
      }
      const newRecord: ReviewRecord = {
        ...record,
        role: record.role || 'reviewer',
        action: 'approve',
      };
      const newReviews = state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'approved' as const, records: [...r.records, newRecord] }
          : r
      );
      saveReviews(newReviews);

      let newSelectedReviewId = state.selectedReviewId;
      if (state.filterStatus === 'pending') {
        const remainingPending = newReviews.filter((r) => r.status === 'pending' && r.id !== id);
        newSelectedReviewId = remainingPending.length > 0 ? remainingPending[0].id : null;
      }

      return { reviews: newReviews, selectedReviewId: newSelectedReviewId };
    }),
  rejectReview: (id, record) =>
    set((state) => {
      const review = state.reviews.find((r) => r.id === id);
      if (!review || review.status !== 'pending') {
        return state;
      }
      const newRecord: ReviewRecord = {
        ...record,
        role: record.role || 'reviewer',
        action: 'reject',
      };
      const newReviews = state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected' as const, records: [...r.records, newRecord] }
          : r
      );
      saveReviews(newReviews);

      let newSelectedReviewId = state.selectedReviewId;
      if (state.filterStatus === 'pending') {
        const remainingPending = newReviews.filter((r) => r.status === 'pending' && r.id !== id);
        newSelectedReviewId = remainingPending.length > 0 ? remainingPending[0].id : null;
      }

      return { reviews: newReviews, selectedReviewId: newSelectedReviewId };
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
