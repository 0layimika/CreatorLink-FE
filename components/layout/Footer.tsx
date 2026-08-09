import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { BrandWordmark } from '@/components/ui/BrandWordmark';

const footerLinks = [
  { name: 'What you get', href: '/#features' },
  { name: 'How it works', href: '/#how-it-works' },
  { name: 'Log in', href: '/login' },
  { name: 'Create account', href: '/signup' },
];

export function Footer() {
  return (
    <footer className="bg-ink py-10 text-white sm:py-14">
      <div className="page-shell">
        <div className="flex flex-col gap-10 border-b border-white/15 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/" aria-label="LinkVerse home">
              <BrandWordmark
                textClassName="font-display text-2xl font-black tracking-[-0.04em] text-white"
                imageClassName="h-9 w-9 rounded-xl"
              />
            </Link>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/60">
              One lovely link for everything you make, sell and share.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href} className="inline-flex items-center gap-1 text-sm font-bold text-white/70 hover:text-secondary">
                {link.name}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-7 text-xs font-semibold uppercase tracking-[0.12em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          <p>Made for creators with too many tabs open.</p>
        </div>
      </div>
    </footer>
  );
}
