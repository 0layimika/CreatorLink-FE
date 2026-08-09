'use client';

import { useMemo, useState } from 'react';
import {
  Instagram,
  Youtube,
  Music2,
  Globe,
  ShoppingBag,
  ArrowUpRight,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Link } from '@/types';
import { analyticsApi } from '@/lib/api';
import { optimizeCloudinaryImage } from '@/lib/media';

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
  cardStyle?: 'solid' | 'outline' | 'glass' | null;
  interactive?: boolean;
}

function getHostname(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

export function LinkButton({ link, textColor, cardStyle = 'glass', interactive = true }: LinkButtonProps) {
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
  const isInternal = link.url.startsWith('/');
  const hostname = getHostname(link.url)?.replace(/^www\./, '');
  const isFeatured = link.display_type === 'featured';

  const className = cn(
        'group w-full rounded-[24px] border p-2.5 pr-4',
        isFeatured ? 'block min-h-[170px]' : 'flex min-h-[76px] items-center gap-4',
        'border-[color:color-mix(in_srgb,var(--creator-text)_18%,transparent)]',
        'backdrop-blur-xl',
        cardStyle === 'outline' ? 'bg-transparent' : cardStyle === 'glass' ? 'bg-[color:color-mix(in_srgb,var(--creator-text)_7%,transparent)]' : 'bg-[var(--creator-accent)]/10',
        'transition duration-200 hover:-translate-y-1 hover:bg-[color:color-mix(in_srgb,var(--creator-text)_11%,transparent)]'
  );

  const content = <>
      {link.thumbnail_url ? (
        <div className={isFeatured ? 'mb-3 aspect-[16/7] w-full overflow-hidden rounded-[18px] bg-[color:color-mix(in_srgb,var(--creator-text)_10%,transparent)]' : 'h-14 w-14 shrink-0 overflow-hidden rounded-[18px] bg-[color:color-mix(in_srgb,var(--creator-text)_10%,transparent)]'}>
          <img
            src={optimizeCloudinaryImage(link.thumbnail_url, isFeatured ? 1200 : 112, isFeatured ? 675 : 112)}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : logoUrl && !isFeatured ? (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[color:color-mix(in_srgb,var(--creator-text)_12%,transparent)] bg-white p-2">
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full rounded-xl object-contain"
            onError={() => setLogoIndex((prev) => prev + 1)}
          />
        </div>
      ) : !isFeatured ? (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[color:color-mix(in_srgb,var(--creator-text)_10%,transparent)]">
          <Icon className="h-5 w-5 opacity-70 transition-opacity group-hover:opacity-100" />
        </div>
      ) : null}
      <span className={cn('min-w-0 text-left', isFeatured ? 'block' : 'flex-1')}>
        <span className="block truncate text-[0.95rem] font-extrabold leading-5">{link.title}</span>
        {isFeatured && link.description && <span className="mt-1 block text-sm leading-5 opacity-70">{link.description}</span>}
        {hostname && <span className="mt-0.5 block truncate text-xs font-semibold opacity-55">{hostname}</span>}
      </span>
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--creator-text)_14%,transparent)] transition group-hover:rotate-6 group-hover:bg-[var(--creator-text)] group-hover:text-[var(--creator-background)]', isFeatured ? 'float-right -mt-8' : '')}>
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
  </>;

  if (!interactive) {
    return <div style={linkStyle} className={className}>{content}</div>;
  }

  return (
    <a
      href={link.url}
      target={isInternal ? undefined : '_blank'}
      rel={isInternal ? undefined : 'noopener noreferrer'}
      onClick={handleClick}
      style={linkStyle}
      className={className}
    >
      {content}
    </a>
  );
}
