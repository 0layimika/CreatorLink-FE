'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { dashboardNavItems, dashboardUtilityItems, isDashboardItemActive } from '@/components/dashboard/dashboard-navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, creator, logout } = useAuth();
  const displayName = `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim() || creator?.username || 'Creator';

  return (
    <>
      <div className="flex h-[68px] items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-xl">
        <Link href="/" aria-label="LinkVerse home"><BrandWordmark textClassName="font-display text-lg font-black tracking-[-0.04em] text-foreground" imageClassName="h-8 w-8 rounded-xl" /></Link>
        <button type="button" onClick={() => setIsOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card" aria-label="Open dashboard menu"><Menu className="h-5 w-5" /></button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="ml-auto flex h-full w-[min(88vw,360px)] flex-col bg-ink p-4 text-white" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex min-w-0 items-center gap-3"><Avatar name={displayName} src={creator?.avatar_url || user?.avatar} size="md" /><div className="min-w-0"><p className="truncate text-sm font-extrabold">{displayName}</p><p className="truncate text-xs text-white/45">@{creator?.username}</p></div></div>
              <button type="button" onClick={() => setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Close dashboard menu"><X className="h-5 w-5" /></button>
            </div>

            <nav className="mt-7 space-y-1" aria-label="Mobile dashboard navigation">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;
                const active = isDashboardItemActive(pathname, item.href, 'exact' in item ? item.exact : false);
                return <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold', active ? 'bg-secondary text-ink' : 'text-white/65')}><Icon className="h-5 w-5" />{item.name}</Link>;
              })}
            </nav>

            <div className="mt-auto space-y-1">
              {creator?.username && <Link href={`/${creator.username}`} target="_blank" className="mb-3 flex items-center justify-between rounded-2xl border border-white/15 px-4 py-3 text-sm font-bold">View public page<ExternalLink className="h-4 w-4 text-secondary" /></Link>}
              {dashboardUtilityItems.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/65"><Icon className="h-5 w-5" />{item.name}</Link>; })}
              <button type="button" onClick={() => { setIsOpen(false); logout(); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/65"><LogOut className="h-5 w-5" />Log out</button>
              <div className="px-1 pt-3"><ThemeToggle /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
