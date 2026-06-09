import type { Review } from '@/types';

export const reviews: Review[] = [
  {
    id: 'r001',
    videoId: 'v001',
    status: 'pending',
    requiredRoles: ['reviewer', 'publisher'],
    sensitiveWords: [
      {
        word: '最棒',
        location: '标题',
        level: 'warning',
      },
      {
        word: '第一',
        location: '字幕第32秒',
        level: 'warning',
      },
    ],
    copyrights: [
      {
        name: '青春活力BGM',
        type: 'bgm',
        status: 'safe',
        tip: '已获得授权',
      },
      {
        name: '校园风景照',
        type: 'image',
        status: 'safe',
        tip: '原创素材',
      },
      {
        name: '思源黑体',
        type: 'font',
        status: 'safe',
        tip: '开源免费字体',
      },
    ],
    records: [
      {
        reviewerId: 'u003',
        reviewerName: '李审核',
        role: 'reviewer',
        action: 'approve',
        comment: '内容整体良好，建议修改敏感词表述',
        timestamp: '2024-08-28 10:30:00',
      },
    ],
  },
  {
    id: 'r002',
    videoId: 'v002',
    status: 'approved',
    requiredRoles: ['reviewer', 'publisher'],
    sensitiveWords: [],
    copyrights: [
      {
        name: '开场音乐',
        type: 'bgm',
        status: 'safe',
        tip: '已获得授权',
      },
      {
        name: '活动现场照片',
        type: 'image',
        status: 'safe',
        tip: '原创素材',
      },
      {
        name: '站酷文艺体',
        type: 'font',
        status: 'warning',
        tip: '建议确认商用授权',
      },
    ],
    records: [
      {
        reviewerId: 'u003',
        reviewerName: '李审核',
        role: 'reviewer',
        action: 'approve',
        comment: '内容符合要求，字体授权请后续跟进',
        timestamp: '2024-08-27 14:20:00',
      },
      {
        reviewerId: 'u004',
        reviewerName: '王审阅',
        role: 'reviewer',
        action: 'approve',
        comment: '同意通过',
        timestamp: '2024-08-27 15:45:00',
      },
      {
        reviewerId: 'u005',
        reviewerName: '陈发布',
        role: 'publisher',
        action: 'approve',
        comment: '已确认发布',
        timestamp: '2024-08-27 17:00:00',
      },
    ],
  },
  {
    id: 'r003',
    videoId: 'v003',
    status: 'rejected',
    requiredRoles: ['reviewer', 'publisher'],
    sensitiveWords: [
      {
        word: '国家级',
        location: '描述文案',
        level: 'danger',
      },
      {
        word: '最高',
        location: '字幕第1分15秒',
        level: 'danger',
      },
    ],
    copyrights: [
      {
        name: '网络流行BGM',
        type: 'bgm',
        status: 'danger',
        tip: '未获得授权，存在版权风险',
      },
      {
        name: '网络图片素材',
        type: 'image',
        status: 'warning',
        tip: '建议使用原创或授权图片',
      },
      {
        name: '商用字体',
        type: 'font',
        status: 'danger',
        tip: '未购买授权，禁止商用',
      },
    ],
    records: [
      {
        reviewerId: 'u003',
        reviewerName: '李审核',
        role: 'reviewer',
        action: 'reject',
        comment: '存在多处敏感词和严重版权问题，请修改后重新提交',
        timestamp: '2024-08-26 11:00:00',
      },
    ],
  },
  {
    id: 'r004',
    videoId: 'v004',
    status: 'approved',
    requiredRoles: ['reviewer', 'publisher'],
    sensitiveWords: [],
    copyrights: [
      {
        name: '原创配乐',
        type: 'bgm',
        status: 'safe',
        tip: '社团原创音乐',
      },
      {
        name: '活动照片',
        type: 'image',
        status: 'safe',
        tip: '原创素材',
      },
      {
        name: '思源宋体',
        type: 'font',
        status: 'safe',
        tip: '开源免费字体',
      },
    ],
    records: [
      {
        reviewerId: 'u004',
        reviewerName: '王审阅',
        role: 'reviewer',
        action: 'approve',
        comment: '原创素材，内容规范，通过审核',
        timestamp: '2024-08-25 09:30:00',
      },
      {
        reviewerId: 'u003',
        reviewerName: '李审核',
        role: 'reviewer',
        action: 'approve',
        comment: '同意通过',
        timestamp: '2024-08-25 10:15:00',
      },
      {
        reviewerId: 'u005',
        reviewerName: '陈发布',
        role: 'publisher',
        action: 'approve',
        comment: '已确认发布',
        timestamp: '2024-08-25 11:30:00',
      },
    ],
  },
];
