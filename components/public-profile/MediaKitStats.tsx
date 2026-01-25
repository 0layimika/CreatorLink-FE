import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import type { MediaKit } from '@/types';

interface MediaKitStatsProps {
  mediaKit: MediaKit;
}

export function MediaKitStats({ mediaKit }: MediaKitStatsProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 text-center shadow-soft">
          <p className="text-3xl font-bold text-foreground">
            {formatNumber(mediaKit.stats.followers)}
          </p>
          <p className="text-sm text-text-secondary mt-1">Followers</p>
        </Card>
        <Card className="p-6 text-center shadow-soft">
          <p className="text-3xl font-bold text-foreground">
            {mediaKit.stats.avgEngagement}%
          </p>
          <p className="text-sm text-text-secondary mt-1">Engagement Rate</p>
        </Card>
        <Card className="p-6 text-center shadow-soft">
          <p className="text-3xl font-bold text-foreground">
            {formatNumber(mediaKit.stats.avgViews)}
          </p>
          <p className="text-sm text-text-secondary mt-1">Avg. Views</p>
        </Card>
      </div>

      {/* Demographics */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Audience Demographics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Age */}
          <div>
            <p className="text-sm text-text-secondary mb-3">Age Distribution</p>
            <div className="space-y-2">
              {mediaKit.demographics.age.map((item) => (
                <div key={item.range} className="flex items-center space-x-3">
                  <span className="text-sm text-foreground w-12">
                    {item.range}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-secondary w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <p className="text-sm text-text-secondary mb-3">Gender</p>
            <div className="space-y-2">
              {mediaKit.demographics.gender.map((item) => (
                <div key={item.type} className="flex items-center space-x-3">
                  <span className="text-sm text-foreground w-16">
                    {item.type}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-secondary w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <p className="text-sm text-text-secondary mb-3">Top Locations</p>
            <div className="space-y-2">
              {mediaKit.demographics.topLocations.slice(0, 4).map((item) => (
                <div key={item.country} className="flex justify-between">
                  <span className="text-sm text-foreground">{item.country}</span>
                  <span className="text-sm text-text-secondary">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Rates */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Collaboration Rates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaKit.rates.map((rate) => (
            <div
              key={rate.type}
              className="p-4 bg-muted rounded-lg border border-border text-center"
            >
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(rate.price, rate.currency)}
              </p>
              <p className="text-sm text-text-secondary mt-1">{rate.type}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Collaborations */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Past Collaborations
        </h3>
        <div className="flex flex-wrap gap-3">
          {mediaKit.collaborations.map((collab) => (
            <Badge key={collab.id} variant="default" className="px-4 py-2 text-sm">
              {collab.brand}
              <span className="text-text-secondary ml-2">• {collab.type}</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
