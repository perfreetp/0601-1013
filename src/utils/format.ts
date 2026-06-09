import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 格式化文件大小 (B, KB, MB, GB)
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化时长 (mm:ss)
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化日期 (YYYY-MM-DD HH:mm)
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化大数字 (1.2万, 3.5k)
export function formatNumber(num: number): string {
  if (!num || num === 0) return '0'

  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }

  return num.toString()
}

// 使用 clsx + tailwind-merge 合并类名
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}
