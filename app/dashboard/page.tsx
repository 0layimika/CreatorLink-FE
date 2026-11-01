'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Banknote, BarChart3, Check, Copy, Eye, ExternalLink, Link2, MousePointer2, Palette, QrCode, ShoppingBag, Sparkles, UserRound, Wallet } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { DashboardError, DashboardLoading, DashboardPageHeader, DashboardPanel, EmptyState, MetricCard, ProgressBar } from '@/components/dashboard/DashboardUI';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLinks } from '@/hooks/useLinks';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/contexts/ToastContext';
import { API_BASE_URL } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { isCredit } from '@/lib/money';

export default function DashboardPage() {
  const { user, creator } = useAuth();
  const { addToast } = useToast();
  const { links, isLoading: linksLoading, error: linksError, refetch: refetchLinks } = useLinks();
  const { overview, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics();
  const { wallet, transactions, bankAccount, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const isLoading = linksLoading || analyticsLoading || walletLoading;
  const firstName = creator?.first_name || user?.firstName || creator?.username || 'Creator';
  const username = creator?.username || user?.username;
  const activeLinks = links.filter((link) => link.enabled);
  const pageCompletionItems = [
    { label: 'Add a profile photo', done: Boolean(creator?.avatar_url), href: '/dashboard/settings', icon: UserRound },
    { label: 'Write your bio', done: Boolean(creator?.bio?.trim()), href: '/dashboard/settings', icon: Sparkles },
    { label: 'Publish your first link', done: links.length > 0, href: '/dashboard/links', icon: Link2 },
    { label: 'Choose your page style', done: true, href: '/dashboard/links', icon: Palette },
    { label: 'Connect a payout account', done: Boolean(bankAccount), href: '/dashboard/wallet', icon: Banknote },
  ];
  const completion = Math.round((pageCompletionItems.filter((item) => item.done).length / pageCompletionItems.length) * 100);
  const error = linksError || analyticsError || walletError;

  const copyPublicLink = async () => {
    if (!username) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${username}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      addToast('Could not copy your link. Try opening your public page instead.', 'error');
    }
  };

  const downloadQr = async () => {
    if (!username) return;
    setQrLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${username}/qr`);
      if (!response.ok) throw new Error();
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `linkverse-${username}-qr.png`;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      addToast('Could not download your QR code. Please try again.', 'error');
    } finally {
      setQrLoading(false);
    }
  };

  if (isLoading) return <DashboardLoading />;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Your workspace"
        title={`Hey ${firstName}, what are we making?`}
        description="A quick look at your page, your audience and the things that need your attention."
        actions={username && <ButtonLink href={`/${username}`} target="_blank" variant="outline"><ExternalLink className="h-4 w-4" />View page</ButtonLink>}
      />

      {error && <DashboardError message={error} onRetry={() => { void Promise.all([refetchLinks(), refetchAnalytics(), refetchWallet()]); }} />}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[32px] border border-ink bg-primary p-6 text-white sm:p-8">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-secondary">Your public page</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-black leading-[0.95] tracking-[-0.055em] sm:text-5xl">Share the one link that does the most.</h2>
            </div>
            <div>
              <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/25 bg-white/10 p-2 pl-4">
                <p className="min-w-0 flex-1 truncate text-sm font-bold text-white/75">linkverse.live/{username}</p>
                <Button type="button" variant="secondary" size="sm" onClick={copyPublicLink}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}</Button>
              </div>
              <button type="button" onClick={downloadQr} disabled={qrLoading} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-white/70 hover:text-secondary disabled:opacity-50"><QrCode className="h-4 w-4" />{qrLoading ? 'Making your QR code…' : 'Download QR code'}</button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-ink bg-secondary p-6 text-ink sm:p-8">
          <div className="flex items-start justify-between"><p className="text-xs font-black uppercase tracking-[0.14em] opacity-60">Page setup</p><span className="font-display text-3xl font-black">{completion}%</span></div>
          <ProgressBar value={completion} className="mt-5 bg-ink/15 [&>div]:bg-ink" />
          <div className="mt-7 space-y-3">
            {pageCompletionItems.filter((item) => !item.done).slice(0, 3).map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-2xl border border-ink/20 bg-white/45 px-4 py-3 text-sm font-extrabold hover:bg-white"><span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.label}</span><ArrowRight className="h-4 w-4" /></Link>; })}
            {completion === 100 && <p className="rounded-2xl bg-white/45 p-4 text-sm font-extrabold">Your essentials are all set. Nice work.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Profile views" value={formatNumber(overview?.totalViews || 0)} change={overview?.viewsChange} icon={Eye} tone="white" />
        <MetricCard label="Unique visitors" value={formatNumber(overview?.uniqueVisitors || 0)} note="This week" icon={UserRound} tone="pink" />
        <MetricCard label="Link clicks" value={formatNumber(overview?.totalClicks || 0)} change={overview?.clicksChange} icon={MousePointer2} tone="lime" />
        <article className="flex flex-col justify-between gap-4 rounded-[28px] border border-ink bg-ink p-5 text-white"><div className="flex justify-between text-xs font-black uppercase tracking-[0.13em] text-white/65">Your wallets<Wallet className="h-5 w-5" /></div>{(['NGN', 'USD'] as const).map((currency) => { const balance = wallet?.wallets.find((entry) => entry.currency === currency); return <div key={currency}><p className="text-xs text-white/65">{currency} · Available to withdraw</p><p className="text-2xl font-black">{formatCurrency(balance?.balance ?? 0, currency)}</p><p className="mt-1 text-xs text-white/65">{formatCurrency(balance?.pending_balance ?? 0, currency)} pending settlement</p></div>; })}</article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel title="Top links" description={`${activeLinks.length} active link${activeLinks.length === 1 ? '' : 's'} on your page`} action={<ButtonLink href="/dashboard/analytics" variant="ghost" size="sm">See analytics<ArrowRight className="h-4 w-4" /></ButtonLink>}>
          {overview?.topLinks.length ? (
            <div className="space-y-5">
              {overview.topLinks.slice(0, 5).map((link, index) => {
                const max = overview.topLinks[0]?.clicks || 1;
                return <div key={link.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-muted text-xs font-black">{index + 1}</span><div className="min-w-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-extrabold text-foreground">{link.title}</p></div><ProgressBar value={(link.clicks / max) * 100} className="mt-2" /></div><span className="text-sm font-black text-foreground">{formatNumber(link.clicks)}</span></div>;
              })}
            </div>
          ) : <EmptyState icon={BarChart3} title="No clicks to rank yet" description="Share your page and your top-performing links will appear here." actionHref="/dashboard/links" actionLabel="Manage your links" />}
        </DashboardPanel>

        <DashboardPanel title="Recent money activity" description="Your latest gifts, sales and withdrawals" action={<ButtonLink href="/dashboard/wallet" variant="ghost" size="sm">Open wallet<ArrowRight className="h-4 w-4" /></ButtonLink>}>
          {transactions.length ? (
            <div className="divide-y divide-border">
              {transactions.slice(0, 5).map((transaction) => {
                const incoming = isCredit(transaction.type);
                return <div key={transaction.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-foreground">{transaction.description || (incoming ? 'Payment received' : transaction.type === 'fee' ? 'Fee' : 'Withdrawal')}</p><p className="mt-1 text-xs text-text-secondary">{new Date(transaction.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} · {transaction.status}</p></div><p className={`shrink-0 text-sm font-black ${incoming ? 'text-success' : 'text-foreground'}`}>{incoming ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}</p></div>;
              })}
            </div>
          ) : <EmptyState icon={ShoppingBag} title="No money activity yet" description="Gifts, store sales and withdrawals will show up here as they happen." actionHref="/dashboard/store" actionLabel="Set up your store" />}
        </DashboardPanel>
      </section>
    </div>
  );
}
