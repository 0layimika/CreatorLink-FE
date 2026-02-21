import { BarChart3, Gift, Palette, QrCode, ShoppingBag, Link as LinkIcon, type LucideIcon } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

const featureItems = [
  {
    area: 'md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/6]',
    icon: Gift,
    title: 'Receive Gifts From Your Audience',
    lines: [
      'Let your supporters send you money directly from your page.',
      'No complicated setup. No awkward DMs. Just support.',
      'Turn fans into supporters in seconds.',
    ],
    accent: 'bg-[#152632] border-[#2c5a70]',
  },
  {
    area: 'md:[grid-area:1/7/2/13] xl:[grid-area:1/6/2/13]',
    icon: LinkIcon,
    title: 'Beautiful Link Pages',
    lines: [
      'Showcase everything you do in one stunning page.',
      'Social links • Products • Content • Projects • Communities',
      'Your entire digital presence. One link.',
    ],
    accent: 'bg-[#141f2d] border-[#2f4f73]',
  },
  {
    area: 'md:[grid-area:2/1/3/7] xl:[grid-area:2/1/3/5]',
    icon: BarChart3,
    title: 'Smart Creator Analytics',
    lines: [
      'Know what your audience actually clicks.',
      'Track: Page views, Link clicks, Engagement, Top performing links.',
      'Make smarter content decisions with real data.',
    ],
    accent: 'bg-[#142323] border-[#2b4b4b]',
  },
  {
    area: 'md:[grid-area:2/7/3/13] xl:[grid-area:2/5/3/9]',
    icon: Palette,
    title: 'Fully Customizable',
    lines: [
      'Make your page feel like YOU.',
      'Themes & colors, Layout control, Custom thumbnails, Creator branding.',
      'Your link page shouldn’t look like everyone else’s.',
    ],
    accent: 'bg-[#222215] border-[#4c4c2e]',
  },
  {
    area: 'md:[grid-area:3/1/4/7] xl:[grid-area:2/9/3/13]',
    icon: QrCode,
    title: 'QR Codes For Everywhere',
    lines: [
      'Turn offline moments into followers and support.',
      'Add your QR code to events, posters, merch, and business cards.',
      'Scan → discover → support.',
    ],
    accent: 'bg-[#13222d] border-[#2f566d]',
  },
  {
    area: 'md:[grid-area:3/7/4/13] xl:[grid-area:3/1/4/13]',
    icon: ShoppingBag,
    title: 'Storefront + Services',
    lines: [
      'Sell your digital and physical products. Sell services as well, and handle your appointments.',
    ],
    accent: 'bg-[#1a2433] border-[#304968]',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-text-secondary mb-3">
            Product features
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-tight">
            Built for creators who want to earn from attention
          </h2>
        </div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 xl:grid-rows-3">
          {featureItems.map((item) => (
            <FeatureTile key={item.title} {...item} />
          ))}
        </ul>
      </div>
    </section>
  );
}

interface FeatureTileProps {
  area: string;
  icon: LucideIcon;
  title: string;
  lines: string[];
  accent: string;
}

function FeatureTile({ area, icon: Icon, title, lines, accent }: FeatureTileProps) {
  return (
    <li className={cn('list-none min-h-[13rem]', area)}>
      <article className="relative h-full rounded-[1.35rem] border border-border/80 p-2">
        <GlowingEffect
          spread={38}
          glow={true}
          disabled={false}
          proximity={70}
          inactiveZone={0.05}
          borderWidth={2}
        />
        <div className="relative h-full rounded-2xl border border-border bg-card p-5 md:p-6 overflow-hidden">
          <div
            className={cn(
              'absolute right-4 top-4 h-16 w-16 rounded-2xl border opacity-80 flex items-center justify-center',
              accent
            )}
          >
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <div className="relative flex h-full flex-col">
            <h3 className="font-display text-xl text-foreground mb-3 leading-snug">{title}</h3>
            <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
              {lines.map((line, idx) => (
                <p key={`${title}-${idx}`}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
