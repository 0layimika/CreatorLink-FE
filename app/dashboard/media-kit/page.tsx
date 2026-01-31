'use client';

import { Sparkles, FileText, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function MediaKitPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-medium">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <Zap className="h-6 w-6 text-secondary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <Sparkles className="h-6 w-6 text-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Coming Soon
          </h1>

          <p className="text-xl text-text-secondary mb-8 max-w-md mx-auto">
            We're building something amazing! The Media Kit feature will help you create professional media kits to attract brands and showcase your work.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg bg-card/50 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Professional Kit</h3>
              <p className="text-sm text-text-secondary">
                Create stunning media kits that showcase your brand
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card/50 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Setup</h3>
              <p className="text-sm text-text-secondary">
                Simple interface to build your kit in minutes
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card/50 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Brand Ready</h3>
              <p className="text-sm text-text-secondary">
                Share your kit with brands and collaborators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/*
// Commented out existing media kit implementation
'use client';

import { useState } from 'react';
import { ExternalLink, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MediaKitForm } from '@/components/dashboard/MediaKitForm';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { mockMediaKit } from '@/data/mock';
import { useAuth } from '@/contexts/AuthContext';
import type { MediaKit } from '@/types';

export default function MediaKitPage() {
  const { user } = useAuth();
  const [mediaKit, setMediaKit] = useState<MediaKit>(mockMediaKit);

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
    : 'Creator';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Kit</h1>
          <p className="text-text-secondary mt-1">
            Create a professional media kit to attract brands
          </p>
        </div>
        <div className="flex space-x-3">
          {user?.username && (
            <a
              href={`/${user.username}/media-kit`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </a>
          )}
          <Button className="shadow-soft">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MediaKitForm mediaKit={mediaKit} onChange={setMediaKit} />

        <div className="hidden lg:block">
          <Card className="sticky top-8 shadow-soft">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 border border-border">
                <div className="text-center mb-6">
                  <Avatar name={displayName} size="xl" className="mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-foreground">
                    {displayName}
                  </h2>
                  <p className="text-primary font-medium">{mediaKit.headline}</p>
                  <p className="text-sm text-text-secondary mt-2 line-clamp-3">
                    {mediaKit.bio}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-card rounded-lg shadow-soft">
                    <p className="text-xl font-bold text-foreground">
                      {formatNumber(mediaKit.stats.followers)}
                    </p>
                    <p className="text-xs text-text-secondary">Followers</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg shadow-soft">
                    <p className="text-xl font-bold text-foreground">
                      {mediaKit.stats.avgEngagement}%
                    </p>
                    <p className="text-xs text-text-secondary">Engagement</p>
                  </div>
                  <div className="text-center p-3 bg-card rounded-lg shadow-soft">
                    <p className="text-xl font-bold text-foreground">
                      {formatNumber(mediaKit.stats.avgViews)}
                    </p>
                    <p className="text-xs text-text-secondary">Avg. Views</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Rates</h3>
                  <div className="space-y-2">
                    {mediaKit.rates.slice(0, 3).map((rate) => (
                      <div
                        key={rate.type}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-text-secondary">{rate.type}</span>
                        <span className="text-foreground font-medium">
                          {formatCurrency(rate.price, rate.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Past Collaborations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mediaKit.collaborations.map((collab) => (
                      <Badge key={collab.id} variant="default">
                        {collab.brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
*/