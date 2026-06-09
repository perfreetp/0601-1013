import { create } from 'zustand';
import type { Member, MemberRole, OperationLog } from '@/types';
import { members as mockMembers, operationLogs as mockLogs } from '@/mock/members';
import { ROLE_LABELS } from '@/utils/constants';

const MEMBERS_KEY = 'club-video-members';
const LOGS_KEY = 'club-video-member-logs';

const loadMembers = (): Member[] => {
  try {
    const stored = localStorage.getItem(MEMBERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load members from localStorage:', e);
  }
  return mockMembers;
};

const loadLogs = (): OperationLog[] => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load logs from localStorage:', e);
  }
  return mockLogs;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
};

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

export const useMemberStore = create<MemberState>((set, get) => ({
  members: loadMembers(),
  logs: loadLogs(),
  searchQuery: '',
  addMember: (member) => {
    const log: OperationLog = {
      id: generateId(),
      memberId: 'current-user',
      memberName: '当前用户',
      action: '添加成员',
      target: `${member.name} (${member.email})`,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const newMembers = [...state.members, member];
      const newLogs = [log, ...state.logs];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(newMembers));
      localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
      return { members: newMembers, logs: newLogs };
    });
  },
  removeMember: (id) => {
    const member = get().members.find((m) => m.id === id);
    if (!member) return;
    const log: OperationLog = {
      id: generateId(),
      memberId: 'current-user',
      memberName: '当前用户',
      action: '移除成员',
      target: `${member.name} (${member.email})`,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const newMembers = state.members.filter((m) => m.id !== id);
      const newLogs = [log, ...state.logs];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(newMembers));
      localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
      return { members: newMembers, logs: newLogs };
    });
  },
  updateMemberRole: (id, role) => {
    const member = get().members.find((m) => m.id === id);
    if (!member) return;
    const oldRoleLabel = ROLE_LABELS[member.role];
    const newRoleLabel = ROLE_LABELS[role];
    const log: OperationLog = {
      id: generateId(),
      memberId: 'current-user',
      memberName: '当前用户',
      action: '修改角色',
      target: `${member.name} 角色由 ${oldRoleLabel} 改为 ${newRoleLabel}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const newMembers = state.members.map((m) => (m.id === id ? { ...m, role } : m));
      const newLogs = [log, ...state.logs];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(newMembers));
      localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
      return { members: newMembers, logs: newLogs };
    });
  },
  setSearch: (query) => set({ searchQuery: query }),
  addLog: (log) =>
    set((state) => {
      const newLogs = [log, ...state.logs];
      localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
      return { logs: newLogs };
    }),
}));
