import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Eye, MousePointer, Heart, UserPlus } from 'lucide-react';
import type { Activity } from '@/types';

const iconMap = {
  view: Eye,
  click: MousePointer,
  tip: Heart,
  follow: UserPlus,
};

const colorMap = {
  view: 'text-primary bg-primary/10',
  click: 'text-secondary bg-secondary/10',
  tip: 'text-error bg-error/10',
  follow: 'text-success bg-success/10',
};

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type];
              const colorClass = colorMap[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">
            No activity yet. Start by adding links to your profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
