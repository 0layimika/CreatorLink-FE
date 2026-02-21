'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Link as LinkIcon,
  BarChart3,
  Wallet,
  FileText,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Store', href: '/dashboard/store', icon: ShoppingBag },
  { name: 'Media Kit', href: '/dashboard/media-kit', icon: FileText },
];

const bottomItems = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
    : 'Creator';

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-md border-r border-border shadow-soft">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-display text-xl font-bold text-foreground">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-text-secondary hover:bg-muted/80 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-muted/80 hover:text-foreground transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-error/10 hover:text-error transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar name={displayName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-text-secondary truncate">
              @{user?.username || 'creator'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
