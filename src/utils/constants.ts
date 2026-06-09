import type { MemberRole, MaterialType, VideoStatus, TemplateCategory } from '@/types'

// 角色中文名称映射
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: '管理员',
  editor: '编辑',
  reviewer: '审核员',
  publisher: '发布员',
  viewer: '浏览者',
}

// 角色对应的 Tailwind 颜色类
export const ROLE_COLORS: Record<MemberRole, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  editor: 'bg-blue-100 text-blue-700 border-blue-200',
  reviewer: 'bg-purple-100 text-purple-700 border-purple-200',
  publisher: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
}

// 素材类型中文名称
export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  video: '视频',
  image: '图片',
  subtitle: '字幕',
  music: '音乐',
}

// 素材类型颜色
export const MATERIAL_TYPE_COLORS: Record<MaterialType, string> = {
  video: 'bg-orange-100 text-orange-700 border-orange-200',
  image: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  subtitle: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  music: 'bg-pink-100 text-pink-700 border-pink-200',
}

// 视频状态中文名称
export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  draft: '草稿',
  reviewing: '审核中',
  approved: '已通过',
  published: '已发布',
  offline: '已下线',
}

// 视频状态颜色
export const VIDEO_STATUS_COLORS: Record<VideoStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  reviewing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  offline: 'bg-red-100 text-red-700 border-red-200',
}

// 模板分类中文名称
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  intro: '片头',
  review: '测评',
  signup: '报名',
}

// 贴纸类型列表（emoji风格）
export const STICKER_TYPES: string[] = [
  '🎉',
  '⭐',
  '🔥',
  '💯',
  '✅',
  '❤️',
  '🎯',
  '🏆',
  '✨',
  '💪',
  '🚀',
  '👑',
  '💎',
  '🌟',
  '🎨',
  '📌',
  '💡',
  '🎪',
  '🌈',
  '🎊',
]
