'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandWordmark } from '@/components/ui/BrandWordmark';

const navLinks = [
  { label: 'What you get', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Made for', href: '#made-for' },
];

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const primaryHref = isAuthenticated ? '/dashboard' : '/signup';
  const primaryLabel = isAuthenticated ? 'Dashboard' : 'Claim your link';

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="page-shell flex h-[76px] items-center justify-between">
        <Link href="/" aria-label="LinkVerse home">
          <BrandWordmark
            textClassName="font-display text-xl font-black tracking-[-0.04em] text-foreground"
            imageClassName="h-8 w-8 rounded-xl"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-text-secondary hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated && (
            <Link href="/login" className="text-sm font-semibold text-foreground hover:text-primary">
              Log in
            </Link>
          )}
          <Link href={primaryHref} className="brand-button brand-button-sm">
            {primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="page-shell border-t border-border py-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-foreground hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {!isAuthenticated && (
              <Link href="/login" className="brand-button brand-button-secondary justify-center">
                Log in
              </Link>
            )}
            <Link href={primaryHref} className="brand-button justify-center">
              {primaryLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
