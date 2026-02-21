'use client';

import { ArrowRight, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const creators = [
  {
    name: 'Sarah Chen',
    role: 'Tech Educator',
    avatar: 'SC',
    color: 'from-blue-500 to-cyan-500',
    stats: { followers: '125K', engagement: '8.5%' },
    links: 4,
  },
  {
    name: 'Marcus Taylor',
    role: 'Fitness Coach',
    avatar: 'MT',
    color: 'from-orange-500 to-red-500',
    stats: { followers: '98K', engagement: '12.3%' },
    links: 6,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Food Creator',
    avatar: 'ER',
    color: 'from-pink-500 to-purple-500',
    stats: { followers: '210K', engagement: '15.7%' },
    links: 5,
  },
];

export function CreatorExamples() {
  return (
    <section id="creators" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-muted/35">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto animate-fade-up">
          <div className="inline-flex items-center space-x-2 bg-background border border-border/60 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-sm text-foreground font-medium">
              Join successful creators
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
            You&apos;re in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-secondary">
              {' '}good company
            </span>
          </h2>

          <p className="text-lg text-text-secondary leading-relaxed">
            Thousands of creators trust LinkVerse to power their online presence
            and grow their audience every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {creators.map((creator, index) => (
            <div
              key={creator.name}
              className="group relative"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative surface-panel hover:border-border rounded-3xl p-8 transition-all duration-300 hover:shadow-medium group-hover:-translate-y-2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${creator.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">
                        {creator.avatar}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-card" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {creator.name}
                    </h3>
                    <p className="text-sm text-text-secondary">{creator.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="font-display text-2xl font-bold text-foreground mb-1">
                      {creator.stats.followers}
                    </div>
                    <div className="text-xs text-text-secondary font-medium">
                      Followers
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="font-display text-2xl font-bold text-primary mb-1">
                      {creator.stats.engagement}
                    </div>
                    <div className="text-xs text-text-secondary font-medium">
                      Engagement
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="text-sm text-text-secondary font-medium">
                    {creator.links} active links
                  </span>
                  <ExternalLink className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="text-base h-12 px-8">
              Start your journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
