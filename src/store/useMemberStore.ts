import { create } from 'zustand';
import type { Member, MemberRole, OperationLog } from '@/types';
import { members, operationLogs } from '@/mock/members';

interface MemberState {
  members: Member[];
  logs: OperationLog[];
  searchQuery: string;
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: MemberRole) => void;
  setSearch: (query: string) => void;
  addLog: (log: OperationLog) => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  members,
  logs: operationLogs,
  searchQuery: '',
  addMember: (member) =>
    set((state) => ({
      members: [...state.members, member],
    })),
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),
  updateMemberRole: (id, role) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, role } : m)),
    })),
  setSearch: (query) => set({ searchQuery: query }),
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs],
    })),
}));
