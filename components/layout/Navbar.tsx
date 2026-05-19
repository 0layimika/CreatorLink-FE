'use client';

import { MiniNavbar } from '@/components/ui/mini-navbar';
import { useAuth } from '@/contexts/AuthContext';
import { BrandWordmark } from '@/components/ui/BrandWordmark';

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
      brand={<BrandWordmark textClassName="font-display text-lg font-bold text-foreground" imageClassName="h-7 w-7 rounded-lg" />}
    />
  );
}
