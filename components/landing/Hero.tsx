'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Gift, Play, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const profileLinks = [
  { label: 'My latest drop', icon: ShoppingBag, tone: 'bg-secondary text-ink' },
  { label: 'Watch the new vlog', icon: Play, tone: 'bg-surface-pink text-ink' },
  { label: 'Work with me', icon: Sparkles, tone: 'bg-surface-blue text-ink' },
];

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="overflow-hidden border-b border-border pt-14 sm:pt-20 lg:pt-24">
      <div className="page-shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="pb-4 lg:pb-14">
            <div className="eyebrow mb-7">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Your corner of the internet
            </div>
            <h1 className="display-hero max-w-[920px]">
              One link.
              <br />
              Your whole <span className="text-primary">creator world.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
              Put your content, shop, bookings and tip jar in one lovely page that feels like you—not a boring list of buttons.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={isAuthenticated ? '/dashboard' : '/signup'} className="brand-button brand-button-lg">
                {isAuthenticated ? 'Open your dashboard' : 'Claim your LinkVerse'}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="brand-button brand-button-lg brand-button-secondary">
                Show me around
              </a>
            </div>
            <p className="mt-5 text-sm font-medium text-text-secondary">
              Start free · Set up in minutes · Make it very, very you
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] pb-16 lg:pb-24">
            <div className="absolute -left-8 top-20 hidden rotate-[-9deg] rounded-[28px] border border-ink bg-secondary px-5 py-4 text-ink shadow-sticker sm:block">
              <Gift className="mb-7 h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.14em]">New gift</p>
              <p className="font-display text-2xl font-black">₦25,000</p>
            </div>

            <div className="relative mx-auto aspect-[1204/2448] w-[min(100%,390px)] drop-shadow-2xl">
              <div
                className="absolute inset-[1.8%_4%_1.8%] overflow-hidden bg-[#f7f3ff] p-[5%] text-ink sm:p-[6%]"
                style={{ borderRadius: 'clamp(24px, 8.5vw, 46px)' }}
              >
                <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-ink/20" />
                <div className="rounded-[28px] bg-primary p-5 text-white">
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white bg-surface-pink text-xl font-black text-ink">
                      AM
                    </div>
                    <div>
                      <p className="font-display text-xl font-black tracking-tight">Amara makes things</p>
                      <p className="mt-1 text-sm text-white/75">Style, stories &amp; soft life ✨</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {profileLinks.map(({ label, icon: Icon, tone }) => (
                    <div key={label} className={`flex items-center justify-between rounded-2xl border border-ink px-4 py-4 font-bold ${tone}`}>
                      <span>{label}</span>
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-ink bg-white p-4">
                    <Gift className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-bold uppercase text-ink/50">Supporters</p>
                    <p className="text-xl font-black">128</p>
                  </div>
                  <div className="rounded-2xl border border-ink bg-white p-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-xs font-bold uppercase text-ink/50">Clicks today</p>
                    <p className="text-xl font-black">2.4k</p>
                  </div>
                </div>
              </div>
              <Image
                src="/assets/phone/velio-iphone-frame.png"
                alt=""
                fill
                sizes="(max-width: 640px) 390px, 390px"
                className="pointer-events-none absolute inset-0 object-contain"
                aria-hidden="true"
              />
            </div>

            <div className="absolute bottom-7 right-0 rotate-[7deg] rounded-[28px] border border-ink bg-surface-pink px-5 py-4 text-ink shadow-sticker sm:right-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Your page</p>
              <p className="mt-1 font-display text-xl font-black">looks good on you.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-border py-7 sm:flex-row sm:items-center sm:justify-between lg:mt-0">
          <p className="max-w-md font-display text-xl font-bold tracking-tight text-foreground">
            Made for people building something of their own.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-text-secondary">
            <span>CREATORS</span><span>DESIGNERS</span><span>COACHES</span><span>FOUNDERS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
