'use client';

import { useEffect, useState } from 'react';
import { Eye, MousePointer, Wallet, ExternalLink, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks } from '@/hooks/useLinks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useWallet } from '@/hooks/useWallet';
import type { Activity } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { links, isLoading: linksLoading } = useLinks();
  const { overview, isLoading: analyticsLoading } = useAnalytics();
  const { wallet, isLoading: walletLoading } = useWallet();

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'view',
      message: 'Your profile is ready to receive views',
      timestamp: 'Just now',
    },
  ]);

  const isLoading = linksLoading || analyticsLoading || walletLoading;
  
  const stats = {
    totalViews: overview?.totalViews || 0,
    totalClicks: overview?.totalClicks || 0,
    totalEarnings: wallet?.balance || 0,
    viewsChange: overview?.viewsChange || 0,
    clicksChange: overview?.clicksChange || 0,
    earningsChange: 0,
  };

  // Update activities based on real data
  useEffect(() => {
    const newActivities: Activity[] = [];

    if (overview?.totalViews && overview.totalViews > 0) {
      newActivities.push({
        id: '1',
        type: 'view',
        message: `Your profile has ${overview.totalViews} total views`,
        timestamp: 'All time',
      });
    }

    if (overview?.totalClicks && overview.totalClicks > 0) {
      newActivities.push({
        id: '2',
        type: 'click',
        message: `Your links received ${overview.totalClicks} clicks`,
        timestamp: 'All time',
      });
    }

    if (wallet?.balance && wallet.balance > 0) {
      newActivities.push({
        id: '3',
        type: 'tip',
        message: `You have ₦${formatNumber(wallet.balance)} in your wallet`,
        timestamp: 'Current balance',
      });
    }

    if (newActivities.length > 0) {
      setActivities(newActivities);
    }
  }, [overview, wallet]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = user?.firstName || user?.username || 'Creator';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s how your page is performing
          </p>
        </div>
        {user?.username && (
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="shadow-soft">
              <ExternalLink className="h-4 w-4 mr-2" />
              View public page
            </Button>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Views"
          value={formatNumber(stats.totalViews)}
          change={stats.viewsChange}
          icon={Eye}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Clicks"
          value={formatNumber(stats.totalClicks)}
          change={stats.clicksChange}
          icon={MousePointer}
          iconColor="text-secondary"
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          change={stats.earningsChange}
          icon={Wallet}
          iconColor="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            {links.length > 0 ? (
              <div className="space-y-4">
                {links.slice(0, 4).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {link.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {link.url}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <MousePointer className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm text-foreground">
                        {formatNumber(link.clicks)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-4">
                No links yet. Add your first link to get started.
              </p>
            )}
          </CardContent>
        </Card>

        <ActivityList activities={activities} />
      </div>
    </div>
  );
}
