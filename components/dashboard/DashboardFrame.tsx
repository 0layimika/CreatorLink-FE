'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DashboardLoading } from '@/components/dashboard/DashboardUI';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, creator, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/login');
    else if (!creator) router.replace('/setup-creator');
  }, [creator, isLoading, router, user]);

  if (isLoading || !user || !creator) return <DashboardLoading label="Opening your workspace…" />;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] lg:block"><Sidebar /></aside>
      <div className="sticky top-0 z-40 lg:hidden"><MobileNav /></div>
      <main className="lg:pl-[280px]">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
