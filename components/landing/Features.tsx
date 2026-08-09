import { BarChart3, CalendarCheck, Gift, Link2, Palette, ShoppingBag, type LucideIcon } from 'lucide-react';

const features = [
  {
    icon: Link2,
    number: '01',
    title: 'All your things, finally together.',
    copy: 'Content, socials, projects, communities—give every good thing you make a proper place to live.',
    className: 'bg-primary text-white md:col-span-7',
    iconClassName: 'bg-white text-primary',
  },
  {
    icon: Gift,
    number: '02',
    title: 'Let the love pay.',
    copy: 'Your people can send a gift right from your page. No awkward DMs. No complicated setup.',
    className: 'bg-secondary text-ink md:col-span-5',
    iconClassName: 'bg-ink text-white',
  },
  {
    icon: ShoppingBag,
    number: '03',
    title: 'Sell without sending people on a treasure hunt.',
    copy: 'Digital drops, physical products and paid services—all a tap away from your bio.',
    className: 'bg-surface-pink text-ink md:col-span-5',
    iconClassName: 'bg-white text-ink',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Know what is actually working.',
    copy: 'See the links people love, where the clicks come from and what deserves more of your energy.',
    className: 'bg-ink text-white md:col-span-7',
    iconClassName: 'bg-secondary text-ink',
  },
  {
    icon: Palette,
    number: '05',
    title: 'Make it look like you.',
    copy: 'Choose the colours, layout, images and little details. Your page should not look borrowed.',
    className: 'bg-surface-blue text-ink md:col-span-6',
    iconClassName: 'bg-primary text-white',
  },
  {
    icon: CalendarCheck,
    number: '06',
    title: 'Bookings without the back-and-forth.',
    copy: 'Show your availability, take service bookings and keep your next client moving.',
    className: 'bg-card text-foreground md:col-span-6',
    iconClassName: 'bg-surface-pink text-ink',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
      <div className="page-shell">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow">The good stuff</p>
            <h2 className="display-section mt-5">A small link doing a lot of work.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-text-secondary lg:ml-auto lg:text-xl">
            LinkVerse is your profile, storefront, booking desk and tiny fan club HQ—all without turning setup into a weekend project.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {features.map((feature) => (
            <FeatureCard key={feature.number} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  number: string;
  title: string;
  copy: string;
  className: string;
  iconClassName: string;
}

function FeatureCard({ icon: Icon, number, title, copy, className, iconClassName }: FeatureCardProps) {
  return (
    <article className={`group flex min-h-[340px] flex-col justify-between rounded-[32px] border border-ink/90 p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-full ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-black opacity-55">/{number}</span>
      </div>
      <div>
        <h3 className="max-w-xl font-display text-3xl font-black leading-[1.02] tracking-[-0.045em] sm:text-4xl">{title}</h3>
        <p className="mt-5 max-w-xl text-base leading-7 opacity-75 sm:text-lg">{copy}</p>
      </div>
    </article>
  );
}
