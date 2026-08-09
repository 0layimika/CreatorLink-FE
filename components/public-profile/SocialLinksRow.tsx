import { Globe2, Linkedin, Mail, Send, type LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import { SiDiscord, SiFacebook, SiInstagram, SiPinterest, SiSnapchat, SiSpotify, SiThreads, SiTiktok, SiTwitch, SiWhatsapp, SiX, SiYoutube } from 'react-icons/si';
import type { SocialLink, SocialPlatform } from '@/types';

const icons: Partial<Record<SocialPlatform, IconType | LucideIcon>> = {
  x: SiX,
  instagram: SiInstagram,
  youtube: SiYoutube,
  facebook: SiFacebook,
  linkedin: Linkedin,
  pinterest: SiPinterest,
  snapchat: SiSnapchat,
  twitch: SiTwitch,
  spotify: SiSpotify,
  threads: SiThreads,
  tiktok: SiTiktok,
  discord: SiDiscord,
  whatsapp: SiWhatsapp,
  telegram: Send,
  email: Mail,
  website: Globe2,
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  x: 'X',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  snapchat: 'Snapchat',
  twitch: 'Twitch',
  spotify: 'Spotify',
  threads: 'Threads',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email',
  website: 'Website',
};

function socialHref(link: SocialLink) {
  const value = link.url.trim();
  if (link.platform === 'email') return value.startsWith('mailto:') ? value : `mailto:${value}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

interface SocialLinksRowProps {
  socialLinks?: SocialLink[] | null;
  interactive?: boolean;
}

export function SocialLinksRow({ socialLinks, interactive = true }: SocialLinksRowProps) {
  const visibleLinks = (socialLinks || [])
    .filter((link) => link.is_visible !== false && link.url?.trim())
    .sort((a, b) => a.position - b.position);

  if (!visibleLinks.length) return null;

  return (
    <div className="creator-socials mt-6 flex flex-wrap justify-center gap-2.5" aria-label="Social links">
      {visibleLinks.map((link) => {
        const Icon = icons[link.platform];
        const label = SOCIAL_PLATFORM_LABELS[link.platform] || link.platform;
        const content = Icon
          ? <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          : <span className="text-xs font-black">{label.slice(0, 2)}</span>;
        const className = 'flex h-8 w-8 items-center justify-center text-[var(--creator-text)] opacity-75 transition hover:-translate-y-0.5 hover:opacity-100';

        if (!interactive) {
          return <span key={link.platform} className={className} title={label}>{content}</span>;
        }

        return (
          <a
            key={link.platform}
            href={socialHref(link)}
            target={link.platform === 'email' ? undefined : '_blank'}
            rel={link.platform === 'email' ? undefined : 'noopener noreferrer'}
            className={className}
            aria-label={label}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
