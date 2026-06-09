import { create } from 'zustand';
import type { Review, ReviewRecord } from '@/types';
import { reviews } from '@/mock/reviews';

interface ReviewState {
  reviews: Review[];
  selectedReviewId: string | null;
  selectReview: (id: string | null) => void;
  approveReview: (id: string, record: Omit<ReviewRecord, 'action'>) => void;
  rejectReview: (id: string, record: Omit<ReviewRecord, 'action'>) => void;
  addComment: (id: string, record: ReviewRecord) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews,
  selectedReviewId: null,
  selectReview: (id) => set({ selectedReviewId: id }),
  approveReview: (id, record) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'approved', records: [...r.records, { ...record, action: 'approve' }] }
          : r
      ),
    })),
  rejectReview: (id, record) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected', records: [...r.records, { ...record, action: 'reject' }] }
          : r
      ),
    })),
  addComment: (id, record) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, records: [...r.records, record] } : r
      ),
    })),
}));
