'use client';

import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MediaKit } from '@/types';

interface MediaKitFormProps {
  mediaKit: MediaKit;
  onChange: (mediaKit: MediaKit) => void;
}

export function MediaKitForm({ mediaKit, onChange }: MediaKitFormProps) {
  const updateField = <K extends keyof MediaKit>(
    field: K,
    value: MediaKit[K]
  ) => {
    onChange({ ...mediaKit, [field]: value });
  };

  const updateStats = (field: keyof MediaKit['stats'], value: number) => {
    onChange({
      ...mediaKit,
      stats: { ...mediaKit.stats, [field]: value },
    });
  };

  const updateRate = (index: number, price: number) => {
    const newRates = [...mediaKit.rates];
    newRates[index] = { ...newRates[index], price };
    onChange({ ...mediaKit, rates: newRates });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Headline"
            value={mediaKit.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            placeholder="e.g., Fashion & Lifestyle Creator"
          />
          <Textarea
            label="Bio"
            value={mediaKit.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell brands about yourself..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Total Followers"
              type="number"
              value={mediaKit.stats.followers}
              onChange={(e) =>
                updateStats('followers', parseInt(e.target.value) || 0)
              }
            />
            <Input
              label="Avg. Engagement Rate (%)"
              type="number"
              step="0.1"
              value={mediaKit.stats.avgEngagement}
              onChange={(e) =>
                updateStats('avgEngagement', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Avg. Views per Post"
              type="number"
              value={mediaKit.stats.avgViews}
              onChange={(e) =>
                updateStats('avgViews', parseInt(e.target.value) || 0)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mediaKit.rates.map((rate, index) => (
              <div
                key={rate.type}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-foreground">{rate.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-text-secondary">₦</span>
                  <Input
                    type="number"
                    value={rate.price}
                    onChange={(e) =>
                      updateRate(index, parseInt(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Past Collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mediaKit.collaborations.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{collab.brand}</p>
                  <p className="text-sm text-text-secondary">{collab.type}</p>
                </div>
                <span className="text-sm text-text-secondary">{collab.date}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            + Add Collaboration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
