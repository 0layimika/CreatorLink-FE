'use client';

import { Link as LinkIcon, BarChart3, Wallet, FileText, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Link: LinkIcon,
  BarChart3,
  Wallet,
  FileText,
};

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = iconMap[feature.icon] || LinkIcon;

  return (
    <div
      className="group relative"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-secondary/5 group-hover:to-primary/5 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />

      <div className="relative bg-card/50 backdrop-blur-sm border border-border/40 hover:border-border rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {feature.title}
          </h3>
          <p className="text-text-secondary leading-relaxed text-sm">
            {feature.description}
          </p>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
      </div>
    </div>
  );
}