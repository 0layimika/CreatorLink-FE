import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CreatorExamples } from '@/components/landing/CreatorExamples';
import { SiteBackground } from '@/components/landing/SiteBackground';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteBackground />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CreatorExamples />
      </main>
      <Footer />
    </div>
  );
}
