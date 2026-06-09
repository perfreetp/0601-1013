import { create } from 'zustand';
import type { MemberRole, Review, ReviewRecord } from '@/types';
import { reviews as initialReviews } from '@/mock/reviews';

const STORAGE_KEY = 'club-video-reviews';

const isTrulyPending = (review: Review): boolean => {
  if (review.status === 'rejected') return false;
  const hasReject = review.records.some((r) => r.action === 'reject');
  if (hasReject) return false;
  const approvedRoles = new Set(
    review.records.filter((r) => r.action === 'approve' && r.role).map((r) => r.role)
  );
  const allApproved = review.requiredRoles.every((role) => approvedRoles.has(role));
  return !allApproved;
};

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
      const role = (record.role || 'reviewer') as MemberRole;
      const hasReject = review.records.some((r) => r.action === 'reject');
      if (hasReject) {
        return state;
      }
      const alreadyApproved = review.records.some(
        (r) => r.action === 'approve' && r.role === role
      );
      if (alreadyApproved) {
        return state;
      }
      const newRecord: ReviewRecord = {
        ...record,
        role,
        action: 'approve',
      };
      const newRecords = [...review.records, newRecord];
      const approvedRoles = new Set(
        newRecords.filter((r) => r.action === 'approve' && r.role).map((r) => r.role)
      );
      const allApproved = review.requiredRoles.every((r) => approvedRoles.has(r));
      const newStatus = allApproved ? 'approved' as const : 'pending' as const;
      const newReviews = state.reviews.map((r) =>
        r.id === id
          ? { ...r, status: newStatus, records: newRecords }
          : r
      );
      saveReviews(newReviews);

      let newSelectedReviewId = state.selectedReviewId;
      if (state.filterStatus === 'pending' && newStatus === 'approved') {
        const remainingPending = newReviews.filter((r) => r.id !== id && isTrulyPending(r));
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
        const remainingPending = newReviews.filter((r) => r.id !== id && isTrulyPending(r));
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
