import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="p-6 shadow-soft hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change !== undefined && change !== 0 && (
            <div
              className={cn(
                'flex items-center space-x-1 mt-2 text-sm',
                isPositive && 'text-success',
                isNegative && 'text-error',
                !isPositive && !isNegative && 'text-text-secondary'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : isNegative ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span>
                {isPositive ? '+' : ''}
                {change}% from last week
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            iconColor === 'text-primary' && 'bg-primary/10',
            iconColor === 'text-secondary' && 'bg-secondary/10',
            iconColor === 'text-success' && 'bg-success/10'
          )}
        >
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>
    </Card>
  );
}
