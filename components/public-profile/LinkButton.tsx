'use client';

import {
  Instagram,
  Youtube,
  Music2,
  Globe,
  ShoppingBag,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Link } from '@/types';
import { analyticsApi } from '@/lib/api';

const iconMap: Record<string, LucideIcon> = {
  Instagram,
  Youtube,
  TikTok: Music2,
  Spotify: Music2,
  Website: Globe,
  ShoppingBag,
  Link: ExternalLink,
};

interface LinkButtonProps {
  link: Link;
}

export function LinkButton({ link }: LinkButtonProps) {
  const Icon = iconMap[link.icon] || ExternalLink;

  const handleClick = async () => {
    // Track the click asynchronously
    try {
      // Convert string ID to number if needed
      const linkId = typeof link.id === 'string' ? parseInt(link.id) : link.id;
      if (!isNaN(linkId)) {
        await analyticsApi.trackLinkClick(linkId.toString());
      }
    } catch {
      // Silently fail tracking
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center space-x-3 w-full p-4 rounded-xl',
        'bg-card border border-border text-foreground shadow-soft',
        'hover:border-primary hover:shadow-medium transition-all',
        'group'
      )}
    >
      <Icon className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
      <span className="font-medium">{link.title}</span>
    </a>
  );
}
