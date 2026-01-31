export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  verified: boolean;
  createdAt: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  thumbnail_url?: string | null;
  clicks: number;
  enabled: boolean;
  order: number;
}

export interface ProfileConfig {
  background_type: 'color' | 'image';
  background_value: string | null;
  text_color: string | null;
  support_button_text?: string | null;
}

export interface Stats {
  totalViews: number;
  totalClicks: number;
  totalEarnings: number;
  viewsChange: number;
  clicksChange: number;
  earningsChange: number;
}

export interface Transaction {
  id: string;
  type: 'tip' | 'withdrawal' | 'payment';
  amount: number;
  currency: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  from?: string;
  reference?: string;
  sender_name?: string;
  sender_email?: string;
}

export interface Activity {
  id: string;
  type: 'view' | 'click' | 'tip' | 'follow';
  message: string;
  timestamp: string;
}

export interface AnalyticsData {
  date: string;
  views: number;
  clicks: number;
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
}

export interface Collaboration {
  id: string;
  brand: string;
  logo: string;
  type: string;
  date: string;
}

export interface MediaKit {
  headline: string;
  bio: string;
  stats: {
    followers: number;
    avgEngagement: number;
    avgViews: number;
  };
  demographics: {
    age: { range: string; percentage: number }[];
    gender: { type: string; percentage: number }[];
    topLocations: { country: string; percentage: number }[];
  };
  collaborations: Collaboration[];
  rates: {
    type: string;
    price: number;
    currency: string;
  }[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface CreatorExample {
  name: string;
  username: string;
  avatar: string;
  category: string;
}
