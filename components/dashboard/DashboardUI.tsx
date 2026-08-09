import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function DashboardPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.15em] text-primary">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl font-black leading-none tracking-[-0.055em] text-foreground sm:text-5xl">{title}</h1>
        {description && <div className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const metricTones = {
  blue: 'bg-primary text-white',
  lime: 'bg-secondary text-ink',
  pink: 'bg-surface-pink text-ink',
  ink: 'bg-ink text-white',
  white: 'bg-card text-foreground',
};

export function MetricCard({ label, value, note, change, icon: Icon, tone = 'white' }: { label: string; value: string; note?: string; change?: number; icon: LucideIcon; tone?: keyof typeof metricTones }) {
  return (
    <article className={cn('flex min-h-44 flex-col justify-between rounded-[28px] border border-ink p-5', metricTones[tone])}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.13em] opacity-65">{label}</p>
        <Icon className="h-5 w-5 opacity-75" />
      </div>
      <div>
        <p className="font-display text-4xl font-black leading-none tracking-[-0.055em] sm:text-5xl">{value}</p>
        {(note || change !== undefined) && (
          <p className="mt-3 text-xs font-bold opacity-65">
            {change !== undefined ? `${change > 0 ? '+' : ''}${change}% vs previous period` : note}
          </p>
        )}
      </div>
    </article>
  );
}

export function DashboardPanel({ title, description, action, children, className, contentClassName }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string; contentClassName?: string }) {
  return (
    <section className={cn('rounded-[28px] border border-border bg-card', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
          <div>
            {title && <h2 className="font-display text-xl font-black tracking-[-0.035em] text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5 sm:p-6', contentClassName)}>{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, action }: { icon: LucideIcon; title: string; description: string; actionLabel?: string; actionHref?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-4 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-ink bg-secondary text-ink shadow-[4px_4px_0_var(--ink)]"><Icon className="h-6 w-6" /></div>
      <h3 className="mt-6 font-display text-2xl font-black tracking-[-0.04em] text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">{description}</p>
      {action || (actionHref && actionLabel && <Link href={actionHref} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary hover:underline">{actionLabel}<ArrowRight className="h-4 w-4" /></Link>)}
    </div>
  );
}

export function DashboardLoading({ label = 'Loading your dashboard…' }: { label?: string }) {
  return <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-sm font-bold text-text-secondary"><LoaderCircle className="h-7 w-7 animate-spin text-primary" />{label}</div>;
}

export function DashboardError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-error/25 bg-error/8 p-4 text-sm text-error" role="alert">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold">{message}</p>
        {onRetry && <Button type="button" variant="ghost" size="sm" onClick={onRetry}><RefreshCw className="h-4 w-4" />Retry</Button>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return <div className={cn('h-2 overflow-hidden rounded-full bg-muted', className)}><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}
