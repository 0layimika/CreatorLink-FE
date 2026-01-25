import type {
  User,
  Link,
  Stats,
  Transaction,
  Activity,
  AnalyticsData,
  TrafficSource,
  MediaKit,
  Feature,
  CreatorExample,
} from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Amara Jones',
  username: 'amarajones',
  email: 'amara@example.com',
  bio: 'Fashion & lifestyle creator sharing style tips and daily inspiration.',
  avatar: '/avatar.jpg',
  verified: true,
  createdAt: '2024-01-15',
};

export const mockLinks: Link[] = [
  {
    id: '1',
    title: 'Follow me on Instagram',
    url: 'https://instagram.com/amarajones',
    icon: 'Instagram',
    clicks: 1245,
    enabled: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Watch my TikToks',
    url: 'https://tiktok.com/@amarajones',
    icon: 'TikTok',
    clicks: 892,
    enabled: true,
    order: 2,
  },
  {
    id: '3',
    title: 'Subscribe on YouTube',
    url: 'https://youtube.com/@amarajones',
    icon: 'Youtube',
    clicks: 567,
    enabled: true,
    order: 3,
  },
  {
    id: '4',
    title: 'Shop my favorites',
    url: 'https://shop.amarajones.com',
    icon: 'ShoppingBag',
    clicks: 1116,
    enabled: true,
    order: 4,
  },
];

export const mockStats: Stats = {
  totalViews: 12450,
  totalClicks: 3820,
  totalEarnings: 45200,
  viewsChange: 12.5,
  clicksChange: 8.3,
  earningsChange: 23.1,
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'tip',
    amount: 5000,
    currency: 'NGN',
    description: 'Tip from @stylefan',
    status: 'completed',
    createdAt: '2024-12-20T10:30:00',
    from: 'stylefan',
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 25000,
    currency: 'NGN',
    description: 'Withdrawal to bank',
    status: 'completed',
    createdAt: '2024-12-18T14:00:00',
  },
  {
    id: '3',
    type: 'tip',
    amount: 2500,
    currency: 'NGN',
    description: 'Tip from @fashionlover',
    status: 'completed',
    createdAt: '2024-12-15T09:15:00',
    from: 'fashionlover',
  },
  {
    id: '4',
    type: 'payment',
    amount: 12700,
    currency: 'NGN',
    description: 'Brand collaboration payment',
    status: 'pending',
    createdAt: '2024-12-14T16:45:00',
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'view',
    message: 'Your profile was viewed 156 times today',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'click',
    message: 'Instagram link received 45 clicks',
    timestamp: '3 hours ago',
  },
  {
    id: '3',
    type: 'tip',
    message: '@stylefan sent you ₦5,000',
    timestamp: '5 hours ago',
  },
  {
    id: '4',
    type: 'follow',
    message: 'Your follower count increased by 23',
    timestamp: '8 hours ago',
  },
];

export const mockAnalyticsData: AnalyticsData[] = [
  { date: 'Jan 1', views: 400, clicks: 120 },
  { date: 'Jan 2', views: 520, clicks: 180 },
  { date: 'Jan 3', views: 380, clicks: 140 },
  { date: 'Jan 4', views: 650, clicks: 220 },
  { date: 'Jan 5', views: 780, clicks: 290 },
  { date: 'Jan 6', views: 620, clicks: 200 },
  { date: 'Jan 7', views: 850, clicks: 320 },
  { date: 'Jan 8', views: 920, clicks: 380 },
  { date: 'Jan 9', views: 750, clicks: 280 },
  { date: 'Jan 10', views: 880, clicks: 340 },
  { date: 'Jan 11', views: 1020, clicks: 420 },
  { date: 'Jan 12', views: 950, clicks: 390 },
  { date: 'Jan 13', views: 1100, clicks: 450 },
  { date: 'Jan 14', views: 1250, clicks: 520 },
];

export const mockTrafficSources: TrafficSource[] = [
  { source: 'Instagram', visits: 4520, percentage: 45 },
  { source: 'TikTok', visits: 2810, percentage: 28 },
  { source: 'Twitter', visits: 1540, percentage: 15 },
  { source: 'Direct', visits: 1220, percentage: 12 },
];

export const mockMediaKit: MediaKit = {
  headline: 'Fashion & Lifestyle Creator',
  bio: 'Creating authentic content that connects brands with engaged audiences. Specializing in fashion, beauty, and lifestyle content.',
  stats: {
    followers: 125000,
    avgEngagement: 4.8,
    avgViews: 45000,
  },
  demographics: {
    age: [
      { range: '18-24', percentage: 35 },
      { range: '25-34', percentage: 45 },
      { range: '35-44', percentage: 15 },
      { range: '45+', percentage: 5 },
    ],
    gender: [
      { type: 'Female', percentage: 72 },
      { type: 'Male', percentage: 26 },
      { type: 'Other', percentage: 2 },
    ],
    topLocations: [
      { country: 'Nigeria', percentage: 45 },
      { country: 'United States', percentage: 20 },
      { country: 'United Kingdom', percentage: 15 },
      { country: 'Ghana', percentage: 10 },
      { country: 'South Africa', percentage: 10 },
    ],
  },
  collaborations: [
    {
      id: '1',
      brand: 'Fashion Nova',
      logo: '/brands/fashionnova.png',
      type: 'Sponsored Post',
      date: '2024-11',
    },
    {
      id: '2',
      brand: 'Sephora',
      logo: '/brands/sephora.png',
      type: 'Brand Ambassador',
      date: '2024-10',
    },
    {
      id: '3',
      brand: 'Nike',
      logo: '/brands/nike.png',
      type: 'Campaign Feature',
      date: '2024-09',
    },
  ],
  rates: [
    { type: 'Instagram Post', price: 150000, currency: 'NGN' },
    { type: 'Instagram Story', price: 50000, currency: 'NGN' },
    { type: 'TikTok Video', price: 200000, currency: 'NGN' },
    { type: 'YouTube Integration', price: 350000, currency: 'NGN' },
  ],
};

export const landingFeatures: Feature[] = [
  {
    icon: 'Link',
    title: 'One Link for Everything',
    description: 'Consolidate all your social profiles, content, and products into one beautiful, customizable page.',
  },
  {
    icon: 'BarChart3',
    title: 'Powerful Analytics',
    description: 'Track clicks, views, and engagement. Understand your audience with detailed insights.',
  },
  {
    icon: 'Wallet',
    title: 'Accept Tips & Payments',
    description: 'Monetize your content with built-in payment support. Let fans support your work directly.',
  },
  {
    icon: 'FileText',
    title: 'Media Kit Builder',
    description: 'Create professional media kits to showcase your stats and attract brand partnerships.',
  },
];

export const creatorExamples: CreatorExample[] = [
  {
    name: 'Amara Jones',
    username: 'amarajones',
    avatar: '/avatars/amara.jpg',
    category: 'Fashion',
  },
  {
    name: 'David Chen',
    username: 'davidtech',
    avatar: '/avatars/david.jpg',
    category: 'Tech',
  },
  {
    name: 'Sofia Martinez',
    username: 'sofiafit',
    avatar: '/avatars/sofia.jpg',
    category: 'Fitness',
  },
];

export const walletBalance = {
  available: 45200,
  pending: 12700,
  currency: 'NGN',
};
