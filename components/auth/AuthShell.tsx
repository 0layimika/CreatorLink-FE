import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleAlert, Info, XCircle } from 'lucide-react';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  step?: string;
  sideTitle?: string;
  sideDescription?: string;
  backHref?: string;
  backLabel?: string;
  wide?: boolean;
}

export function AuthShell({
  eyebrow = 'Your LinkVerse starts here',
  title,
  description,
  children,
  footer,
  step,
  sideTitle = 'One link. Plenty of personality.',
  sideDescription = 'Bring your work, shop, bookings and supporters together without building a whole website from scratch.',
  backHref,
  backLabel = 'Back',
  wide = false,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-ink bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-36 -top-28 h-96 w-96 rounded-full border-[72px] border-secondary/90" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-surface-pink" />
        <Link href="/" className="relative z-10 w-fit" aria-label="LinkVerse home">
          <BrandWordmark
            textClassName="font-display text-2xl font-black tracking-[-0.04em] text-white"
            imageClassName="h-9 w-9 rounded-xl border border-white/30"
          />
        </Link>

        <div className="relative z-10 max-w-xl py-20">
          <p className="font-display text-6xl font-black leading-[0.9] tracking-[-0.065em] xl:text-7xl">
            {sideTitle}
          </p>
          <p className="mt-7 max-w-md text-lg leading-8 text-white/70">{sideDescription}</p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-bold text-white/65">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          Your work deserves a proper home.
        </div>
      </aside>

      <section className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8 lg:justify-end">
          <Link href="/" className="lg:hidden" aria-label="LinkVerse home">
            <BrandWordmark
              textClassName="font-display text-xl font-black tracking-[-0.04em] text-foreground"
              imageClassName="h-8 w-8 rounded-xl"
            />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
          <div className={cn('w-full', wide ? 'max-w-2xl' : 'max-w-[520px]')}>
            {backHref && (
              <Link href={backHref} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            )}

            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
                {step && <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-black text-text-secondary">{step}</span>}
              </div>
              <h1 className="mt-4 font-display text-4xl font-black leading-[0.95] tracking-[-0.055em] text-foreground sm:text-5xl">
                {title}
              </h1>
              <div className="mt-4 max-w-xl text-base leading-7 text-text-secondary">{description}</div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5 shadow-soft sm:p-7">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

interface FormAlertProps {
  tone?: 'error' | 'success' | 'info';
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function FormAlert({ tone = 'error', title, children, action }: FormAlertProps) {
  const styles = {
    error: { box: 'border-error/30 bg-error/8 text-error', icon: XCircle },
    success: { box: 'border-success/30 bg-success/8 text-success', icon: CheckCircle2 },
    info: { box: 'border-primary/25 bg-primary/8 text-foreground', icon: Info },
  }[tone];
  const Icon = styles.icon;

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6', styles.box)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-extrabold">{title}</p>}
        <div className={cn(title && 'mt-0.5', 'opacity-85')}>{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

interface AuthStateProps {
  icon?: 'success' | 'error' | 'info';
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

export function AuthState({ icon = 'info', title, description, children }: AuthStateProps) {
  const Icon = icon === 'success' ? CheckCircle2 : icon === 'error' ? CircleAlert : Info;
  const tone = icon === 'success' ? 'bg-secondary text-ink' : icon === 'error' ? 'bg-error text-white' : 'bg-surface-blue text-ink';

  return (
    <div className="py-3 text-center sm:py-5">
      <div className={cn('mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-ink shadow-[4px_4px_0_var(--ink)]', tone)}>
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-7 font-display text-3xl font-black tracking-[-0.04em] text-foreground">{title}</h2>
      <div className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">{description}</div>
      {children && <div className="mt-7">{children}</div>}
    </div>
  );
}
