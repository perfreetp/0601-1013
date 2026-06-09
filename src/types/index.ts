export type MaterialType = 'video' | 'image' | 'subtitle' | 'music';
export type MemberRole = 'admin' | 'editor' | 'reviewer' | 'publisher' | 'viewer';
export type VideoStatus = 'draft' | 'reviewing' | 'approved' | 'published' | 'offline';
export type TemplateCategory = 'intro' | 'review' | 'signup';
export type ScheduleStatus = 'pending' | 'published' | 'offline';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  url: string;
  size: number;
  duration?: number;
  cover?: string;
  tags: string[];
  createdAt: string;
}

export interface Clip {
  id: string;
  materialId: string;
  startTime: number;
  endTime: number;
  track: number;
}

export interface Sticker {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  startTime: number;
  endTime: number;
}

export interface VideoProject {
  id: string;
  title: string;
  cover: string;
  status: VideoStatus;
  clips: Clip[];
  stickers: Sticker[];
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  thumbnail: string;
  style: string;
  usageCount: number;
}

export interface Schedule {
  id: string;
  videoId: string;
  title: string;
  status: ScheduleStatus;
  isPinned: boolean;
  publishAt: string;
  offlineAt?: string;
}

export interface SensitiveWord {
  word: string;
  location: string;
  level: 'warning' | 'danger';
}

export interface CopyrightItem {
  name: string;
  type: 'bgm' | 'image' | 'font';
  status: 'safe' | 'warning' | 'danger';
  tip: string;
}

export interface ReviewRecord {
  reviewerId: string;
  reviewerName: string;
  role?: MemberRole;
  action: 'approve' | 'reject';
  comment: string;
  timestamp: string;
}

export interface Review {
  id: string;
  videoId: string;
  status: ReviewStatus;
  requiredRoles: MemberRole[];
  sensitiveWords: SensitiveWord[];
  copyrights: CopyrightItem[];
  records: ReviewRecord[];
}

export interface DailyData {
  date: string;
  views: number;
  likes: number;
  shares: number;
  signUpClicks: number;
}

export interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface Analytics {
  videoId: string;
  videoTitle: string;
  views: number;
  likes: number;
  shares: number;
  signUpClicks: number;
  daily: DailyData[];
  sources: SourceData[];
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: MemberRole;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  memberId: string;
  memberName: string;
  action: string;
  target: string;
  timestamp: string;
  targetMemberId?: string;
  oldValue?: string;
  newValue?: string;
  operatorId?: string;
  operatorName?: string;
}
