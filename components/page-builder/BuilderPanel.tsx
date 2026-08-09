import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function BuilderPanel({ icon: Icon, title, description, children }: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-card">
      <header className="flex items-start gap-3 border-b border-border p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink bg-secondary text-ink">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-black tracking-[-0.045em] text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
