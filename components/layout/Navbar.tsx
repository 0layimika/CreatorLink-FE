'use client';

import Image from 'next/image';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import { useAuth } from '@/contexts/AuthContext';
import { siteConfig } from '@/lib/constants';

export function Navbar() {
  const { isAuthenticated } = useAuth();

  const actions = isAuthenticated
    ? [{ label: 'Dashboard', href: '/dashboard' }]
    : [
        { label: 'Log in', href: '/login' },
        { label: 'Sign up', href: '/signup' },
      ];

  return (
    <MiniNavbar
      links={[]}
      actions={actions}
      showGlyph={false}
      brand={
        <Image
          src={siteConfig.logoWordmark}
          alt={siteConfig.name}
          width={136}
          height={32}
          className="h-7 w-auto"
          priority
        />
      }
    />
  );
}
