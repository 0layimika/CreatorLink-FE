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

export type StoreProductType = 'digital' | 'physical' | 'service';

export interface StoreProduct {
  id: number;
  creator_id: number;
  type: StoreProductType;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  cover_url?: string | null;
  is_active: boolean;
  download_limit?: number;
  file_id?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  duration_minutes?: number | null;
  buffer_minutes?: number | null;
  timezone?: string | null;
  requires_address?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type StoreOrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface StoreOrder {
  id: number;
  creator_id: number;
  product_id: number;
  product?: StoreProduct;
  buyer_email: string;
  buyer_name?: string | null;
  buyer_phone?: string | null;
  delivery_address?: Record<string, any> | null;
  status: StoreOrderStatus;
  amount: number;
  currency: string;
  reference: string;
  provider: string;
  provider_reference?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export type ServiceBookingStatus = 'hold' | 'confirmed' | 'expired' | 'cancelled';

export interface ServiceBooking {
  id: number;
  service_id: number;
  creator_id: number;
  order_id?: number | null;
  slot_start: string;
  slot_end: string;
  status: ServiceBookingStatus;
  hold_expires_at?: string | null;
  buyer_email?: string | null;
  buyer_name?: string | null;
  buyer_phone?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceAvailabilityWindow {
  id: number;
  creator_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}
