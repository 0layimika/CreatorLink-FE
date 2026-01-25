'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Home,
  Link as LinkIcon,
  BarChart3,
  Wallet,
  FileText,
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
  { name: 'Media Kit', href: '/dashboard/media-kit', icon: FileText },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username
    : 'Creator';

  return (
    <>
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-soft">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-bold text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed top-0 left-0 h-full w-72 bg-card border-r border-border shadow-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
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

            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                      isActive
                        ? 'bg-gradient-primary text-white'
                        : 'text-text-secondary hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-error/10 hover:text-error transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
