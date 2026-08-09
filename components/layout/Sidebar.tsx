'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { dashboardNavItems, dashboardUtilityItems, isDashboardItemActive } from '@/components/dashboard/dashboard-navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user, creator, logout } = useAuth();
  const displayName = `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim() || creator?.username || 'Creator';

  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-ink p-4 text-white">
      <Link href="/" className="mb-8 px-3 py-3" aria-label="LinkVerse home">
        <BrandWordmark textClassName="font-display text-xl font-black tracking-[-0.04em] text-white" imageClassName="h-8 w-8 rounded-xl" />
      </Link>

      <nav className="space-y-1" aria-label="Dashboard navigation">
        {dashboardNavItems.map((item) => {
          const active = isDashboardItemActive(pathname, item.href, 'exact' in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-colors', active ? 'bg-secondary text-ink' : 'text-white/60 hover:bg-white/8 hover:text-white')}>
              <Icon className="h-5 w-5" />{item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-8">
        {creator?.username && (
          <Link href={`/${creator.username}`} target="_blank" className="mb-4 flex items-center justify-between rounded-2xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-bold text-white hover:border-secondary/60">
            View public page <ExternalLink className="h-4 w-4 text-secondary" />
          </Link>
        )}
        {dashboardUtilityItems.map((item) => {
          const Icon = item.icon;
          const active = isDashboardItemActive(pathname, item.href);
          return <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold', active ? 'bg-white text-ink' : 'text-white/60 hover:bg-white/8 hover:text-white')}><Icon className="h-5 w-5" />{item.name}</Link>;
        })}
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-white/60 hover:bg-error/15 hover:text-white"><LogOut className="h-5 w-5" />Log out</button>
        <div className="pt-3"><ThemeToggle /></div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-2 pt-5">
        <Avatar name={displayName} src={creator?.avatar_url || user?.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-white">{displayName}</p>
          <p className="truncate text-xs text-white/45">@{creator?.username}</p>
        </div>
      </div>
    </div>
  );
}
