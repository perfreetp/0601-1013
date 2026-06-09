import type { Analytics } from '@/types';

const generateDailyData = (base: { views: number; likes: number; shares: number; signUpClicks: number }) => {
  const data = [];
  const now = new Date('2024-08-28');
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const factor = 0.7 + Math.random() * 0.6;
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.round(base.views / 7 * factor),
      likes: Math.round(base.likes / 7 * factor),
      shares: Math.round(base.shares / 7 * factor),
      signUpClicks: Math.round(base.signUpClicks / 7 * factor),
    });
  }
  return data;
};

export const analytics: Analytics[] = [
  {
    videoId: 'v001',
    videoTitle: '2024秋季招新宣传视频',
    views: 15680,
    likes: 2340,
    shares: 856,
    signUpClicks: 1245,
    daily: generateDailyData({ views: 15680, likes: 2340, shares: 856, signUpClicks: 1245 }),
    sources: [
      { source: '校园群', count: 5230, percentage: 33.4 },
      { source: '朋友圈', count: 4120, percentage: 26.3 },
      { source: '海报扫码', count: 2890, percentage: 18.4 },
      { source: '同学推荐', count: 2150, percentage: 13.7 },
      { source: '官网', count: 1290, percentage: 8.2 },
    ],
  },
  {
    videoId: 'v003',
    videoTitle: '迎新晚会宣传视频',
    views: 23450,
    likes: 4560,
    shares: 1230,
    signUpClicks: 890,
    daily: generateDailyData({ views: 23450, likes: 4560, shares: 1230, signUpClicks: 890 }),
    sources: [
      { source: '校园群', count: 8540, percentage: 36.4 },
      { source: '朋友圈', count: 6230, percentage: 26.6 },
      { source: '海报扫码', count: 3890, percentage: 16.6 },
      { source: '同学推荐', count: 2780, percentage: 11.9 },
      { source: '官网', count: 2010, percentage: 8.5 },
    ],
  },
  {
    videoId: 'v004',
    videoTitle: '部门招新介绍合集',
    views: 9870,
    likes: 1230,
    shares: 456,
    signUpClicks: 2156,
    daily: generateDailyData({ views: 9870, likes: 1230, shares: 456, signUpClicks: 2156 }),
    sources: [
      { source: '校园群', count: 3450, percentage: 34.9 },
      { source: '朋友圈', count: 2560, percentage: 25.9 },
      { source: '同学推荐', count: 1780, percentage: 18.0 },
      { source: '海报扫码', count: 1230, percentage: 12.5 },
      { source: '官网', count: 850, percentage: 8.7 },
    ],
  },
  {
    videoId: 'v005',
    videoTitle: '学长学姐经验分享',
    views: 7650,
    likes: 1890,
    shares: 678,
    signUpClicks: 567,
    daily: generateDailyData({ views: 7650, likes: 1890, shares: 678, signUpClicks: 567 }),
    sources: [
      { source: '校园群', count: 2890, percentage: 37.8 },
      { source: '同学推荐', count: 1920, percentage: 25.1 },
      { source: '朋友圈', count: 1450, percentage: 19.0 },
      { source: '官网', count: 780, percentage: 10.2 },
      { source: '海报扫码', count: 610, percentage: 7.9 },
    ],
  },
  {
    videoId: 'v006',
    videoTitle: '校园生活vlog',
    views: 31200,
    likes: 6780,
    shares: 2340,
    signUpClicks: 780,
    daily: generateDailyData({ views: 31200, likes: 6780, shares: 2340, signUpClicks: 780 }),
    sources: [
      { source: '朋友圈', count: 12340, percentage: 39.5 },
      { source: '校园群', count: 8760, percentage: 28.1 },
      { source: '同学推荐', count: 4890, percentage: 15.7 },
      { source: '海报扫码', count: 3120, percentage: 10.0 },
      { source: '官网', count: 2090, percentage: 6.7 },
    ],
  },
];
