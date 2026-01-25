'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              Now accepting Nigerian Naira
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            One link for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {' '}
              everything{' '}
            </span>
            you create
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            Consolidate your social profiles, content, and shop into a single,
            beautiful page. Track analytics, accept tips, and grow your audience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto shadow-medium">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto shadow-medium">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/#">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See an example
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-card rounded-2xl border border-border p-4 shadow-medium max-w-lg mx-auto">
            <div className="bg-muted rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">AJ</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Amara Jones</h3>
                  <p className="text-sm text-text-secondary">
                    Fashion & Lifestyle Creator
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {['Instagram', 'TikTok', 'YouTube', 'Shop'].map((item) => (
                  <div
                    key={item}
                    className="bg-card rounded-lg p-3 text-center text-foreground font-medium border border-border hover:border-primary/50 hover:shadow-soft transition-all cursor-pointer"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-medium text-sm shadow-soft hover:shadow-medium transition-shadow">
                  Support me
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
