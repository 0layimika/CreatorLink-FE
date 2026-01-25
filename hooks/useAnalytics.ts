'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/lib/api';

interface AnalyticsOverview {
  totalViews: number;
  totalClicks: number;
  viewsChange: number;
  clicksChange: number;
  dailyStats: Array<{ date: string; views: number; clicks: number }>;
  topLinks: Array<{ id: string; title: string; url?: string; clicks: number }>;
}

interface UseAnalyticsReturn {
  overview: AnalyticsOverview | null;
  isLoading: boolean;
  error: string | null;
  refetch: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
}

export function useAnalytics(params?: { startDate?: string; endDate?: string }): UseAnalyticsReturn {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (fetchParams?: { startDate?: string; endDate?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyticsApi.getOverview(fetchParams);
      console.log('Analytics API response:', response);
      if (response.success && response.data) {
        // Map backend response structure to frontend expected structure
        const backendData = response.data as any;
        console.log('Backend data:', backendData);
        console.log('Summary:', backendData.summary);
        const mappedData: AnalyticsOverview = {
          totalViews: backendData.summary?.total_profile_views || 0,
          totalClicks: backendData.summary?.total_link_clicks || 0,
          viewsChange: backendData.summary?.profile_views_change || 0,
          clicksChange: backendData.summary?.link_clicks_change || 0,
          dailyStats: (backendData.daily_breakdown || []).map((item: any) => ({
            date: item.date,
            views: item.views || 0,
            clicks: item.clicks || 0,
          })),
          topLinks: (backendData.top_links || []).map((link: any) => ({
            id: link.link_id?.toString() || '',
            title: link.title || '',
            url: link.url || '',
            clicks: link.clicks || 0,
          })),
        };
        console.log('Mapped analytics data:', mappedData);
        setOverview(mappedData);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(params);
  }, [fetchOverview, params?.startDate, params?.endDate]);

  return {
    overview,
    isLoading,
    error,
    refetch: fetchOverview,
  };
}

