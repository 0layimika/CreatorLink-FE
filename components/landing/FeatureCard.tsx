import { Link, BarChart3, Wallet, FileText, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Feature } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  Link,
  BarChart3,
  Wallet,
  FileText,
};

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = iconMap[feature.icon] || Link;

  return (
    <Card className="p-6 hover:border-primary/50 hover:shadow-medium transition-all shadow-soft">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {feature.title}
      </h3>
      <p className="text-text-secondary">{feature.description}</p>
    </Card>
  );
}
