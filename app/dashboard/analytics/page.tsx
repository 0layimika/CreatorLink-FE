'use client';

// import dynamic from 'next/dynamic';
import { Eye, MousePointer, TrendingUp, Globe, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatNumber } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

// const LineChart = dynamic(() => import('@/components/charts/LineChart'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[350px] flex items-center justify-center text-text-secondary">
//       <Loader2 className="h-6 w-6 animate-spin mr-2" />
//       Loading chart...
//     </div>
//   ),
// });

// const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[300px] flex items-center justify-center text-text-secondary">
//       <Loader2 className="h-6 w-6 animate-spin mr-2" />
//       Loading chart...
//     </div>
//   ),
// });

export default function AnalyticsPage() {
  const { overview, isLoading: analyticsLoading } = useAnalytics();

  const isLoading = analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalViews = overview?.totalViews || 0;
  const totalClicks = overview?.totalClicks || 0;
  const clickThroughRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Transform daily stats for the chart
  // const analyticsData = overview?.dailyStats?.map((stat) => ({
  //   date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  //   views: stat.views,
  //   clicks: stat.clicks,
  // })) || [];

  // Mock traffic sources for now (could be extended in backend)
  // const trafficSources = [
  //   { source: 'Direct', visits: Math.floor(totalViews * 0.4), percentage: 40 },
  //   { source: 'Social', visits: Math.floor(totalViews * 0.35), percentage: 35 },
  //   { source: 'Referral', visits: Math.floor(totalViews * 0.25), percentage: 25 },
  // ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-text-secondary mt-1">
          Track your performance and understand your audience
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={formatNumber(totalViews)}
          change={overview?.viewsChange || 0}
          icon={Eye}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Clicks"
          value={formatNumber(totalClicks)}
          change={overview?.clicksChange || 0}
          icon={MousePointer}
          iconColor="text-secondary"
        />
        <StatCard
          title="Click Rate"
          value={`${clickThroughRate}%`}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Traffic Sources"
          value="3"
          icon={Globe}
          iconColor="text-primary"
        />
      </div>

      {/* Charts section - commented out for now */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Views & Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.length > 0 ? (
              <LineChart data={analyticsData} />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-text-secondary">
                No data available yet. Start sharing your profile to see analytics.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {totalViews > 0 ? (
              <BarChart data={trafficSources} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-secondary">
                No traffic data yet. Views will be categorized by source.
              </div>
            )}
          </CardContent>
        </Card>
      </div> */}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Link Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {overview?.topLinks && overview.topLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Link
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                      Clicks
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topLinks.map((link) => {
                    const percentage = totalClicks > 0
                      ? ((link.clicks / totalClicks) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr
                        key={link.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {link.title}
                            </p>
                            <p className="text-xs text-text-secondary truncate max-w-xs">
                              {link.url || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-foreground">
                          {formatNumber(link.clicks)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-foreground">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">
              No link performance data yet. Start sharing your links to see their performance.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
