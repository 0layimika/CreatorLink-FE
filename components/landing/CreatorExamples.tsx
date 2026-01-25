import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { creatorExamples } from '@/data/mock';

export function CreatorExamples() {
  return (
    <section id="creators" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join thousands of creators
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From fashion influencers to tech reviewers, creators everywhere trust
            LinkVerse to power their online presence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatorExamples.map((creator) => (
            <Link key={creator.username} href="/#">
              <Card className="p-6 hover:border-primary/50 hover:shadow-medium transition-all cursor-pointer group shadow-soft">
                <div className="flex items-center space-x-4">
                  <Avatar name={creator.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {creator.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      @{creator.username}
                    </p>
                  </div>
                  <Badge variant="secondary">{creator.category}</Badge>
                </div>
                <div className="mt-4 flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                  <span>View profile</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
