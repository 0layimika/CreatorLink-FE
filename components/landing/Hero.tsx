'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { BackgroundPathsLayer } from '@/components/ui/background-paths';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-transparent overflow-hidden">
      <BackgroundPathsLayer />
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs text-text-secondary tracking-wide uppercase mb-6">
              Built for modern creators
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-foreground mb-6">
              Turn your link in bio into a money-making machine
            </h1>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mb-8 leading-relaxed">
              Create a stunning creator page, receive gifts, showcase your work,
              and turn followers into supporters — all in one place.
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <span className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Go to dashboard
                </span>
              </Link>
            ) : (
              <InteractiveHoverButton
                text="get your linkverse"
                className="w-52 border-border bg-transparent text-foreground"
                onClick={() => router.push('/signup')}
              />
            )}
            <div className="mt-8 space-y-2">
              <p className="text-sm text-text-secondary">
                Used by creators, designers, influencers &amp; online brands
              </p>
              <p className="text-sm text-text-secondary">
                Built for creators who want to earn from attention
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-text-secondary mb-2">
                    Live profile preview
                  </p>
                  <p className="font-display text-lg text-foreground">@amara.creates</p>
                  <p className="text-sm text-text-secondary mt-1">Fashion, beauty, lifestyle</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Instagram', 'Store', 'Media Kit', 'Book Service'].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-[#1b2030] border border-[#2b3350] px-4 py-3">
                  <p className="text-sm text-foreground">
                    Gift received: <span className="font-semibold">$25</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-[#17282a] border border-[#2a4245] px-4 py-3">
                  <p className="text-sm text-foreground">
                    Today: <span className="font-semibold">128 profile visits</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
