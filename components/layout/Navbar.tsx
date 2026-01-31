'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={36}
                height={36}
                className="rounded-xl transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/#features"
              className="px-4 py-2 text-sm text-text-secondary hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
            >
              Features
            </Link>
            <Link
              href="/#creators"
              className="px-4 py-2 text-sm text-text-secondary hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
            >
              Creators
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-2 text-sm text-text-secondary hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10">
                    Get Started
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/40">
            <div className="flex flex-col space-y-1">
              <Link
                href="/#features"
                className="text-text-secondary hover:text-foreground transition-colors px-4 py-3 font-medium rounded-lg hover:bg-muted/50"
              >
                Features
              </Link>
              <Link
                href="/#creators"
                className="text-text-secondary hover:text-foreground transition-colors px-4 py-3 font-medium rounded-lg hover:bg-muted/50"
              >
                Creators
              </Link>
              <Link
                href="/#pricing"
                className="text-text-secondary hover:text-foreground transition-colors px-4 py-3 font-medium rounded-lg hover:bg-muted/50"
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-4 mt-2 border-t border-border/40">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                        Get Started
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}