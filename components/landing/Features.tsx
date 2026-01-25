import { FeatureCard } from './FeatureCard';
import { landingFeatures } from '@/data/mock';

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to grow
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            LinkVerse gives you the tools to connect with your audience,
            monetize your content, and build your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landingFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
