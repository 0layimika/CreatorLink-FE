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
  textColor?: string;
}

export function LinkButton({ link, textColor }: LinkButtonProps) {
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

  const linkStyle = textColor ? { color: textColor } : undefined;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={linkStyle}
      className={cn(
        'flex items-center space-x-3 w-full p-4 rounded-xl',
        'bg-card/80 backdrop-blur border border-border shadow-soft',
        'hover:shadow-medium transition-all',
        'group'
      )}
    >
      {link.thumbnail_url ? (
        <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted">
          <img
            src={link.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <Icon className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
      <span className="font-medium truncate flex-1 text-left">{link.title}</span>
    </a>
  );
}
