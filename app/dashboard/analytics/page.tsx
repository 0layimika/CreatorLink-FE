'use client';

import { BarChart3, Eye, MousePointer2, TrendingUp, UserRound } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import { Select } from '@/components/ui/Input';
import { DashboardError, DashboardLoading, DashboardPageHeader, DashboardPanel, EmptyState, MetricCard, ProgressBar } from '@/components/dashboard/DashboardUI';
import { useAnalytics, type AnalyticsPeriod } from '@/hooks/useAnalytics';
import { formatNumber } from '@/lib/utils';

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this_week' },
  { label: 'This month', value: 'this_month' },
  { label: 'All time', value: 'all_time' },
];

export default function AnalyticsPage() {
  const { overview, period, setPeriod, isLoading, error, refetch } = useAnalytics();
  const totalViews = overview?.totalViews || 0;
  const totalClicks = overview?.totalClicks || 0;
  const clickRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const chartData = (overview?.dailyStats || []).map((item) => ({
    ...item,
    date: new Date(`${item.date}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Performance"
        title="Analytics"
        description="See what people notice, what they click and which parts of your page deserve more attention."
        actions={<div className="w-44"><Select aria-label="Analytics period" value={period} options={periodOptions} onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)} /></div>}
      />

      {error && <DashboardError message={error} onRetry={() => void refetch()} />}
      {isLoading ? <DashboardLoading label="Crunching your numbers…" /> : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Profile views" value={formatNumber(totalViews)} change={overview?.viewsChange} icon={Eye} tone="blue" />
            <MetricCard label="Unique visitors" value={formatNumber(overview?.uniqueVisitors || 0)} note="Distinct people" icon={UserRound} tone="pink" />
            <MetricCard label="Link clicks" value={formatNumber(totalClicks)} change={overview?.clicksChange} icon={MousePointer2} tone="lime" />
            <MetricCard label="Click-through rate" value={`${clickRate.toFixed(1)}%`} note="Clicks per profile view" icon={TrendingUp} tone="ink" />
          </section>

          <DashboardPanel title="Views and clicks" description="Daily activity for the selected period">
            {chartData.length ? <div className="h-[350px] w-full"><LineChart data={chartData} /></div> : <EmptyState icon={BarChart3} title="Nothing to chart yet" description="Once people visit your page, views and clicks will appear here day by day." />}
          </DashboardPanel>

          <DashboardPanel title="Link performance" description="Your links ranked by clicks in this period">
            {overview?.topLinks.length ? (
              <div className="space-y-5">
                {overview.topLinks.map((link, index) => {
                  const share = totalClicks > 0 ? (link.clicks / totalClicks) * 100 : 0;
                  return (
                    <div key={link.id} className="grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)_5rem] sm:items-center">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-black">{index + 1}</span>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-4"><p className="truncate text-sm font-extrabold text-foreground">{link.title}</p><p className="shrink-0 text-xs font-bold text-text-secondary sm:hidden">{formatNumber(link.clicks)} clicks</p></div>
                        <p className="mt-1 truncate text-xs text-text-secondary">{link.url}</p>
                        <ProgressBar value={share} className="mt-2" />
                      </div>
                      <div className="hidden text-right sm:block"><p className="text-sm font-black text-foreground">{formatNumber(link.clicks)}</p><p className="text-xs text-text-secondary">{share.toFixed(1)}%</p></div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon={MousePointer2} title="No link clicks yet" description="Share your public page and this list will show which links your audience cares about most." actionHref="/dashboard/links" actionLabel="Open page editor" />}
          </DashboardPanel>

          <DashboardPanel title="Top sources" description="Where profile visitors came from in this period">
            {overview?.topSources.length ? <div className="space-y-4">{overview.topSources.map((source, index) => { const share = totalViews > 0 ? (source.visits / totalViews) * 100 : 0; return <div key={source.source} className="grid grid-cols-[2rem_minmax(0,1fr)_5rem] items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-black">{index + 1}</span><div className="min-w-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-extrabold capitalize text-foreground">{source.source}</p><span className="text-xs font-bold text-text-secondary">{formatNumber(source.visits)}</span></div><ProgressBar value={share} className="mt-2" /></div><p className="text-right text-xs font-bold text-text-secondary">{share.toFixed(1)}%</p></div>; })}</div> : <EmptyState icon={Eye} title="No sources yet" description="Share your page with campaign links to see where visitors come from." />}
          </DashboardPanel>
        </>
      )}
    </div>
  );
}
