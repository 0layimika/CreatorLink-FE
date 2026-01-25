'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#"
              className="text-text-secondary hover:text-foreground transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="/#"
              className="text-text-secondary hover:text-foreground transition-colors font-medium"
            >
              Creators
            </Link>
            <Link
              href="/#"
              className="text-text-secondary hover:text-foreground transition-colors font-medium"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="shadow-soft">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button className="shadow-soft">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#"
                className="text-text-secondary hover:text-foreground transition-colors px-2 py-1 font-medium"
              >
                Features
              </Link>
              <Link
                href="/#"
                className="text-text-secondary hover:text-foreground transition-colors px-2 py-1 font-medium"
              >
                Creators
              </Link>
              <Link
                href="/#"
                className="text-text-secondary hover:text-foreground transition-colors px-2 py-1 font-medium"
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button className="w-full shadow-soft">
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
                      <Button className="w-full shadow-soft">Get Started</Button>
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
