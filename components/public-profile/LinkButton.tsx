'use client';

import { useEffect, useMemo, useState } from 'react';
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

function getHostname(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

export function LinkButton({ link, textColor }: LinkButtonProps) {
  const Icon = iconMap[link.icon] || ExternalLink;
  const [logoIndex, setLogoIndex] = useState(0);

  const logoUrls = useMemo(() => {
    const hostname = getHostname(link.url);
    if (!hostname) return [];

    return [
      // Prefer higher-res favicon providers first.
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      // DuckDuckGo fallback.
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
      // Direct site favicon as final attempt.
      `https://${hostname}/favicon.ico`,
    ];
  }, [link.url]);
  const logoUrl = logoUrls[logoIndex];

  useEffect(() => {
    setLogoIndex(0);
  }, [link.url, link.thumbnail_url]);

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
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted">
          <img
            src={link.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : logoUrl ? (
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
          <img
            src={logoUrl}
            alt=""
            className="w-full h-full object-cover rounded-full"
            onError={() => setLogoIndex((prev) => prev + 1)}
          />
        </div>
      ) : (
        <Icon className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
      <span className="font-medium truncate flex-1 text-left">{link.title}</span>
    </a>
  );
}
