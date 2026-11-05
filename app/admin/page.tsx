'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, Check, Clock3, LayoutDashboard, Loader2, LogOut, RefreshCw, ShieldCheck, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BrandWordmark } from '@/components/ui/BrandWordmark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { adminApi } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { AdminOverview } from '@/types/admin';
import { AdminRecords, type RecordKind } from '@/components/admin/AdminRecords';
import { AdminActionDialog, type AdminAction } from '@/components/admin/AdminActionDialog';

type Tab = 'overview' | RecordKind;
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'releases', label: 'Settlements', icon: Clock3 },
  { id: 'audit', label: 'Audit log', icon: ShieldCheck },
] as const;
const titles = { overview: 'Platform overview', users: 'Your creator community', transactions: 'Every money movement', releases: 'Pending settlements', audit: 'Admin activity' };
const subtitles = { overview: 'A clear view of your users and the money they hold.', users: 'Find accounts, manage access, and make wallet adjustments.', transactions: 'Follow gifts, sales, fees, payouts, and wallet debits.', releases: 'Review held payments and move them to the main balance.', audit: 'See who changed what, when, and why.' };

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied' | 'error'>('checking');
  const [accessError, setAccessError] = useState('');
  const [sessionRetry, setSessionRetry] = useState(0);
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [action, setAction] = useState<AdminAction | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    setAccess('checking');
    void adminApi.session().then(() => { if (active) setAccess('allowed'); }).catch((err) => {
      if (active) { setAccess(err instanceof ApiError && err.status === 403 ? 'denied' : 'error'); setAccessError(err instanceof Error ? err.message : 'Could not verify access.'); }
    });
    return () => { active = false; };
  }, [isLoading, user, sessionRetry]);

  const loadOverview = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const response = await adminApi.overview();
      if (!response.data) throw new Error('No overview returned.');
      setOverview(response.data);
      setUpdatedAt(new Date());
    } catch (err) { setSummaryError(err instanceof Error ? err.message : 'Could not load overview.'); }
    finally { setSummaryLoading(false); }
  }, []);
  useEffect(() => { if (access === 'allowed') void loadOverview(); }, [access, loadOverview, refreshKey]);
  const refresh = () => setRefreshKey((value) => value + 1);

  if (isLoading || (user && access === 'checking')) return <div role="status" className="flex min-h-screen items-center justify-center gap-3 text-sm text-text-secondary"><Loader2 className="h-5 w-5 animate-spin" />Checking administrator access…</div>;
  if (!user || access !== 'allowed') return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center"><ShieldCheck className="mx-auto mb-5 h-10 w-10 text-primary" /><h1 className="text-2xl font-black">{!user ? 'Admin sign in' : access === 'denied' ? 'Administrator access required' : 'Unable to verify access'}</h1><p className="mt-3 text-sm leading-6 text-text-secondary">{!user ? 'Sign in with your administrator account to manage LinkVerse.' : access === 'denied' ? 'This account does not have access to the admin dashboard.' : accessError}</p>{!user ? <Link href="/login?redirect=/admin" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white">Sign in<ArrowRight className="h-4 w-4" /></Link> : <div className="mt-6 flex justify-center gap-4">{access === 'error' && <button onClick={() => setSessionRetry((value) => value + 1)} className="text-sm font-bold text-primary">Try again</button>}<button onClick={logout} className="text-sm font-bold text-primary">Sign out</button><Link href="/dashboard" className="text-sm font-bold">Creator dashboard</Link></div>}</div></main>;

  return <div className="min-h-screen bg-background text-foreground lg:pl-60">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-[#111713] p-5 text-white lg:flex">
      <Link href="/" className="mb-1 mt-3"><BrandWordmark textClassName="text-xl font-black tracking-tight text-white" imageClassName="h-8 w-8 rounded-lg" /></Link><span className="mb-10 ml-10 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Admin workspace</span>
      <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Manage platform</p>
      <nav aria-label="Admin navigation" className="space-y-1.5">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${tab === id ? 'bg-[#baff3c] text-[#111713]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon className="h-[18px] w-[18px]" />{label}{id === 'releases' && !!overview?.pending_releases && <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] ${tab === id ? 'bg-black/10' : 'bg-white/10'}`}>{overview.pending_releases}</span>}</button>)}</nav>
      <div className="mt-auto"><div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="mb-2 h-5 w-5 text-[#baff3c]" /><p className="text-xs font-bold">You’re in control.</p><p className="mt-2 text-[11px] leading-5 text-white/40">Every admin action is recorded for a clear account of changes.</p></div><Link href="/dashboard" className="flex items-center justify-between px-2 py-3 text-xs text-white/50 hover:text-white">Creator dashboard<ArrowUpRight className="h-4 w-4" /></Link><button onClick={logout} className="flex w-full items-center gap-2 px-2 py-3 text-xs text-white/50 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button><div className="mt-4 border-t border-white/10 px-2 pt-5"><p className="text-xs font-bold">Administrator</p><p className="mt-1 truncate text-[11px] text-white/40">{user.email}</p></div></div>
    </aside>
    <header className="flex min-h-18 items-center justify-between gap-3 border-b border-border bg-card px-5 py-4 sm:px-8"><div className="flex items-center gap-2 text-xs text-text-secondary"><ShieldCheck className="h-4 w-4 text-primary" /><span className="font-bold text-foreground">Admin</span><span className="mx-1 text-border">/</span>{navigation.find((item) => item.id === tab)?.label}</div><div className="flex items-center gap-3"><span className="hidden rounded-full border border-border px-3 py-1.5 text-[10px] font-bold text-text-secondary sm:block">LinkVerse operations</span><ThemeToggle /><button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 lg:hidden"><LogOut className="h-4 w-4" /></button></div></header>
    <nav aria-label="Mobile admin navigation" className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 lg:hidden">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${tab === id ? 'bg-primary/10 text-primary' : 'text-text-secondary'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</nav>
    <main className="mx-auto max-w-[1560px] space-y-7 p-5 sm:p-8 xl:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">The big picture, down to the details</p><h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">{titles[tab]}</h1><p className="mt-2 text-sm text-text-secondary">{subtitles[tab]}</p></div><button onClick={refresh} disabled={summaryLoading} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold hover:bg-muted disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${summaryLoading ? 'animate-spin' : ''}`} />Refresh data</button></div>
      {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm"><span className="flex min-w-0 items-start gap-2 [overflow-wrap:anywhere]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div>}
      {summaryError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error"><span>Overview could not refresh: {summaryError}{overview ? ' Previously loaded totals are shown.' : ''}</span><button onClick={refresh} className="font-bold underline">Retry</button></div>}
      {tab === 'overview' ? <>
        <div className="grid gap-4 sm:grid-cols-2">{(['USD', 'NGN'] as const).map((currency) => {
          const wallet = overview?.wallets.find((item) => item.currency === currency);
          const available = wallet?.available ?? '0.00'; const pending = wallet?.pending ?? '0.00';
          return <section key={currency} className={`relative overflow-hidden rounded-2xl border p-6 sm:p-7 ${currency === 'USD' ? 'border-[#25362c] bg-[#17261e] text-white' : 'border-border bg-card'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${currency === 'USD' ? 'bg-white/10 text-[#baff3c]' : 'bg-muted text-foreground'}`}>{currency === 'USD' ? '$' : '₦'}</span><span className={`text-xs font-semibold ${currency === 'USD' ? 'text-white/60' : 'text-text-secondary'}`}>Total {currency} in wallets</span></div><Wallet className={`h-4 w-4 ${currency === 'USD' ? 'text-white/30' : 'text-text-secondary'}`} /></div><p className="mb-1 mt-6 break-all text-4xl font-black tracking-[-0.05em] tabular-nums xl:text-5xl">{overview ? formatCurrency(wallet?.total ?? '0.00', currency) : '—'}</p><p className={`text-[11px] ${currency === 'USD' ? 'text-white/40' : 'text-text-secondary'}`}>Main + pending · {wallet?.wallets || 0} wallets</p><div className={`mt-7 grid grid-cols-2 gap-3 border-t pt-5 ${currency === 'USD' ? 'border-white/10' : 'border-border'}`}><div><p className={`mb-2 text-[10px] uppercase tracking-wider ${currency === 'USD' ? 'text-white/45' : 'text-text-secondary'}`}>Main balance</p><p className={`break-all text-lg font-bold tabular-nums ${currency === 'USD' ? 'text-[#baff3c]' : ''}`}>{overview ? formatCurrency(available, currency) : '—'}</p></div><div><p className={`mb-2 text-[10px] uppercase tracking-wider ${currency === 'USD' ? 'text-white/45' : 'text-text-secondary'}`}>Pending balance</p><p className="break-all text-lg font-bold tabular-nums">{overview ? formatCurrency(pending, currency) : '—'}</p></div></div></section>;
        })}</div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[
          { label: 'Total users', value: overview?.users.total, icon: Users, target: 'users' as Tab, help: 'All registered accounts' },
          { label: 'Active users', value: overview?.users.active, icon: Check, target: 'users' as Tab, help: 'Accounts with access' },
          { label: 'Blocked users', value: overview?.users.blocked, icon: ShieldCheck, target: 'users' as Tab, help: 'Currently restricted' },
          { label: 'Pending settlements', value: overview?.pending_releases, icon: Clock3, target: 'releases' as Tab, help: 'Waiting for release' },
        ].map(({ label, value, icon: Icon, target, help }) => <button key={label} onClick={() => setTab(target)} className="group rounded-2xl border border-border bg-card p-5 text-left hover:border-primary/40"><div className="mb-5 flex items-center justify-between"><Icon className="h-[18px] w-[18px] text-text-secondary" /><ArrowUpRight className="h-3.5 w-3.5 text-text-secondary opacity-0 group-hover:opacity-100" /></div><p className="text-3xl font-black tracking-tight tabular-nums">{value?.toLocaleString() ?? '—'}</p><p className="mt-2 text-xs font-bold">{label}</p><p className="mt-1 text-[10px] text-text-secondary">{help}</p></button>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-accent/30 p-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-card p-2.5"><Clock3 className="h-5 w-5 text-primary" /></span><div><h2 className="text-sm font-bold">Keep an eye on pending funds.</h2><p className="mt-1 text-xs leading-5 text-text-secondary">Review individual payments and release eligible funds to a user’s main wallet.</p></div></div><button onClick={() => setTab('releases')} className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold">Review settlements<ArrowRight className="h-3.5 w-3.5" /></button></div>
        <AdminRecords kind="transactions" refreshKey={refreshKey} onAction={setAction} compact />
      </> : <AdminRecords key={tab} kind={tab} refreshKey={refreshKey} onAction={setAction} />}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[10px] text-text-secondary"><span>LinkVerse · Admin workspace</span><span>{summaryLoading ? 'Refreshing overview…' : updatedAt ? `Overview updated ${updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data'}</span></footer>
    </main>
    {action && <AdminActionDialog action={action} onClose={() => setAction(null)} onSuccess={(message) => { setNotice(message); setAction(null); refresh(); }} />}
  </div>;
}
