'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function ThemeFloatingToggle() {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <ThemeToggle />
    </div>
  );
}
