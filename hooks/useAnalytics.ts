'use client';

import { useCallback, useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';

export type AnalyticsPeriod = 'today' | 'this_week' | 'this_month' | 'all_time';

interface AnalyticsApiResponse {
  period?: AnalyticsPeriod;
  summary?: {
    total_profile_views?: number;
    total_link_clicks?: number;
    unique_visitors?: number;
    profile_views_change?: number;
    link_clicks_change?: number;
  };
  daily_breakdown?: Array<{ date: string; views?: number; clicks?: number }>;
  top_links?: Array<{ link_id?: number; title?: string; url?: string; clicks?: number }>;
  top_sources?: Array<{ source?: string; visits?: number }>;
}

export interface AnalyticsOverview {
  period: AnalyticsPeriod;
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  viewsChange: number;
  clicksChange: number;
  dailyStats: Array<{ date: string; views: number; clicks: number }>;
  topLinks: Array<{ id: string; title: string; url: string; clicks: number }>;
  topSources: Array<{ source: string; visits: number }>;
}

export function useAnalytics(initialPeriod: AnalyticsPeriod = 'this_week') {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (nextPeriod: AnalyticsPeriod = period) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsApi.getOverview(nextPeriod);
      if (!response.success || !response.data) throw new Error(response.message || 'Failed to fetch analytics');
      const data = response.data as AnalyticsApiResponse;
      setOverview({
        period: data.period || nextPeriod,
        totalViews: data.summary?.total_profile_views || 0,
        totalClicks: data.summary?.total_link_clicks || 0,
        uniqueVisitors: data.summary?.unique_visitors || 0,
        viewsChange: data.summary?.profile_views_change || 0,
        clicksChange: data.summary?.link_clicks_change || 0,
        dailyStats: (data.daily_breakdown || []).map((item) => ({ date: item.date, views: item.views || 0, clicks: item.clicks || 0 })),
        topLinks: (data.top_links || []).map((link) => ({ id: String(link.link_id || ''), title: link.title || 'Untitled link', url: link.url || '', clicks: link.clicks || 0 })),
        topSources: (data.top_sources || []).map((source) => ({ source: source.source || 'direct', visits: source.visits || 0 })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { void fetchOverview(period); }, [fetchOverview, period]);

  const changePeriod = (nextPeriod: AnalyticsPeriod) => {
    if (nextPeriod !== period) setPeriod(nextPeriod);
  };

  return { overview, period, setPeriod: changePeriod, isLoading, error, refetch: () => fetchOverview(period) };
}
