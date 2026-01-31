'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutDashboard, Instagram, Youtube, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center space-x-2 bg-muted border border-border/40 rounded-full px-4 py-2 mb-8 hover:border-border transition-colors group cursor-pointer">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-foreground font-medium">
              Now accepting Nigerian Naira
            </span>
            <ArrowRight className="h-3 w-3 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
            One link for
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-foreground">
                everything
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl" />
            </span>
            {' '}you create
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Consolidate your social profiles, content, and shop into a single,
            beautiful page. Track analytics, accept tips, and grow your audience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 text-base h-12 px-8"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 text-base h-12 px-8"
                >
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/#creators">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-border/40 hover:bg-muted/50 text-base h-12 px-8"
              >
                See an example
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-sm text-text-secondary mb-20">
            {/* <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-background"
                  />
                ))}
              </div>
              <span className="font-medium">10,000+ creators</span>
            </div> */}
            <div className="hidden sm:block w-px h-4 bg-border/40" />
            <span className="hidden sm:inline font-medium">Free to start</span>
          </div>
        </div>

        {/* Hero Card Preview */}
        <div className="relative max-w-md mx-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />

          <div className="relative bg-card/80 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-2xl">
            <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-8 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">AJ</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-muted" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Amara Jones</h3>
                  <p className="text-sm text-text-secondary">
                    Fashion & Lifestyle Creator
                  </p>
                </div>
              </div>

              {/* Link Buttons */}
              <div className="space-y-3">
                {[
                  { icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-purple-500' },
                  { icon: Youtube, label: 'YouTube', color: 'from-red-500 to-red-600' },
                  { icon: ShoppingBag, label: 'My Shop', color: 'from-blue-500 to-cyan-500' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="group w-full bg-card/80 backdrop-blur-sm hover:bg-card border border-border/40 hover:border-border rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-foreground font-semibold">{item.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Support Button */}
              <button className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Support me</span>
                </div>
              </button>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl blur-xl" />
        </div>
      </div>
    </section>
  );
}