'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Search, ShieldCheck, SlidersHorizontal, Users, Wallet, X } from 'lucide-react';
import type { AdminAudit, AdminPage, AdminRelease, AdminTransaction, AdminUser } from '@/types/admin';
import { adminApi } from '@/lib/admin-api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { AdminAction } from './AdminActionDialog';

export type RecordKind = 'users' | 'transactions' | 'releases' | 'audit';
type Row = AdminUser | AdminTransaction | AdminRelease | AdminAudit;
const labels = { users: 'Users', transactions: 'Transactions', releases: 'Pending settlements', audit: 'Audit log' };
const actionNames: Record<string, string> = { block_user: 'Blocked user', unblock_user: 'Unblocked user', debit_wallet: 'Debited wallet', release_pending: 'Released pending funds' };
const typeNames: Record<string, string> = { gift: 'Gift', store: 'Store sale', withdrawal: 'Withdrawal', fee: 'Fee', admin_debit: 'Admin debit' };

export function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'good' | 'bad' | 'pending' | 'neutral' }) {
  const styles = { good: 'bg-success/10 text-success', bad: 'bg-error/10 text-error', pending: 'bg-warning/10 text-warning', neutral: 'bg-muted text-text-secondary' };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
}

function Person({ email, username, first_name, last_name }: { email: string; username?: string | null; first_name?: string | null; last_name?: string | null }) {
  const name = [first_name, last_name].filter(Boolean).join(' ') || username || email;
  return <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-xs font-black uppercase">{name.slice(0, 2)}</span><div className="min-w-0"><p className="max-w-64 truncate font-bold">{name}</p><p className="mt-1 max-w-64 truncate text-xs text-text-secondary">{email}</p></div></div>;
}

export function AdminRecords({ kind, refreshKey, onAction, userFilter, onClearUser, compact = false }: {
  kind: RecordKind; refreshKey: number; onAction: (action: AdminAction) => void;
  userFilter?: AdminUser | null; onClearUser?: () => void; compact?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currency, setCurrency] = useState('');
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<AdminPage<Row> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const limit = compact ? 8 : 25;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const query = { search, status, currency, limit, offset, user_id: userFilter?.id };
        const response = kind === 'users' ? await adminApi.users(query, controller.signal)
          : kind === 'transactions' ? await adminApi.transactions(query, controller.signal)
          : kind === 'releases' ? await adminApi.releases(query, controller.signal)
          : await adminApi.audit(query, controller.signal);
        if (active) {
          if (!response.data) throw new Error('No data returned. Please refresh.');
          setResult(response.data);
        }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Could not load records.'); }
      finally { if (active) setLoading(false); }
    }, search ? 250 : 0);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [kind, search, status, currency, offset, limit, refreshKey, retry, userFilter?.id]);

  function filter(setter: (value: string) => void, value: string) { setter(value); setOffset(0); }
  const selectClass = 'h-10 max-w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold';
  const th = 'whitespace-nowrap px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-text-secondary';
  const td = 'px-5 py-4 align-top text-sm';
  const items = result?.items || [];

  return <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-6"><div><h2 className="font-extrabold tracking-tight">{compact ? 'Latest activity' : labels[kind]}{!loading && result && <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">{result.total.toLocaleString()}</span>}</h2><p className="mt-1 text-xs text-text-secondary">{kind === 'users' ? 'Every account, including users without a creator profile.' : kind === 'releases' ? 'Received payments waiting to become available for withdrawal.' : kind === 'audit' ? 'A record of every admin change, its author, and its reason.' : 'Payment status and wallet settlement are shown separately.'}</p></div><SlidersHorizontal className="h-4 w-4 text-text-secondary" /></div>
    {!compact && kind !== 'audit' && <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
      <label className="relative min-w-48 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" /><input type="search" aria-label={`Search ${labels[kind].toLowerCase()}`} placeholder={kind === 'users' ? 'Search name, email or username…' : 'Search reference, email or username…'} value={search} onChange={(event) => filter(setSearch, event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-xs" /></label>
      {kind !== 'releases' && <select aria-label="Filter by status" value={status} onChange={(event) => filter(setStatus, event.target.value)} className={selectClass}><option value="">All statuses</option>{(kind === 'users' ? ['active', 'blocked'] : ['completed', 'pending', 'failed']).map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select>}
      {kind !== 'users' && <select aria-label="Filter by currency" value={currency} onChange={(event) => filter(setCurrency, event.target.value)} className={selectClass}><option value="">All currencies</option><option>USD</option><option>NGN</option></select>}
    </div>}
    {userFilter && <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-3 text-xs"><span>Showing records for <strong>{userFilter.email}</strong></span><button onClick={onClearUser} className="flex items-center gap-1 font-bold text-primary"><X className="h-3 w-3" />Clear</button></div>}
    {error ? <div role="alert" className="p-8 text-center text-sm"><p className="text-error">{error}</p><button onClick={() => setRetry((value) => value + 1)} className="mt-3 font-bold text-primary">Try again</button></div> : loading ? <div role="status" className="space-y-4 p-6">{[0, 1, 2].map((key) => <div key={key} className="h-12 animate-pulse rounded-xl bg-muted" />)}<span className="sr-only">Loading records…</span></div> : !items.length ? <div className="flex flex-col items-center px-6 py-14 text-center"><span className="mb-3 rounded-2xl bg-muted p-4"><Search className="h-5 w-5 text-text-secondary" /></span><p className="text-sm font-bold">{search || status || currency ? 'No matching records' : kind === 'releases' ? 'All caught up' : 'No records yet'}</p><p className="mt-2 text-xs text-text-secondary">{kind === 'releases' && !search ? 'Pending settlements will appear here when payments are held.' : 'Try adjusting your filters or refresh for new activity.'}</p></div> : <div className="overflow-x-auto">
      {kind === 'users' ? <table className="w-full min-w-[860px]"><thead className="bg-muted/35"><tr>{['User', 'Status', 'USD main / pending', 'NGN main / pending', 'Joined', 'Manage'].map((label) => <th key={label} className={th}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{(items as AdminUser[]).map((user) => <UserRows key={user.id} user={user} expanded={expandedUser === user.id} onExpand={() => setExpandedUser((id) => id === user.id ? null : user.id)} onAction={onAction} td={td} />)}</tbody></table>
      : kind === 'transactions' ? <table className="w-full min-w-[850px]"><thead className="bg-muted/35"><tr>{['Transaction', 'User', 'Amount', 'Payment', 'Wallet settlement', 'Date'].map((label) => <th key={label} className={th}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{(items as AdminTransaction[]).map((transaction) => {
        const incoming = ['gift', 'store'].includes(transaction.type);
        const settlement = transaction.metadata?.wallet_settlement as { status?: string } | undefined;
        return <tr key={transaction.id} className="hover:bg-muted/20"><td className={td}><div className="flex items-center gap-2"><span className={`rounded-lg p-2 ${incoming ? 'bg-success/10 text-success' : 'bg-muted text-text-secondary'}`}>{incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span><span className="font-bold">{typeNames[transaction.type] || transaction.type}</span></div><details className="mt-2 text-xs text-text-secondary"><summary className="max-w-52 cursor-pointer truncate font-mono">{transaction.reference}</summary><p className="mt-2 max-w-64 break-all font-mono">{transaction.reference}</p><p className="mt-2 max-w-64 break-words">{transaction.description}</p><p className="mt-1">Transaction #{transaction.id} · {transaction.provider}</p></details></td><td className={td}><Person {...transaction} /></td><td className={`${td} whitespace-nowrap font-bold tabular-nums ${incoming ? 'text-success' : ''}`}>{incoming ? '+' : '−'}{formatCurrency(transaction.amount, transaction.currency)}</td><td className={td}><StatusPill tone={transaction.status === 'completed' ? 'good' : transaction.status === 'failed' ? 'bad' : 'pending'}>{transaction.status}</StatusPill></td><td className={td}>{settlement?.status ? <StatusPill tone={settlement.status === 'pending' ? 'pending' : 'good'}>{settlement.status === 'pending' ? 'Pending balance' : 'Main balance'}</StatusPill> : <span className="text-xs text-text-secondary">{incoming && transaction.status !== 'completed' ? 'Awaiting payment' : '—'}</span>}</td><td className={`${td} whitespace-nowrap text-xs text-text-secondary`}>{formatDateTime(transaction.created_at)}</td></tr>;
      })}</tbody></table>
      : kind === 'releases' ? <table className="w-full min-w-[800px]"><thead className="bg-muted/35"><tr>{['User', 'Pending amount', 'Source transaction', 'Scheduled release', 'Action'].map((label) => <th key={label} className={th}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{(items as AdminRelease[]).map((release) => <tr key={release.id} className="hover:bg-muted/20"><td className={td}><Person {...release} /></td><td className={`${td} whitespace-nowrap font-bold tabular-nums`}>{formatCurrency(release.amount, release.currency)}</td><td className={td}><p className="font-semibold">{typeNames[release.type] || release.type} #{release.transaction_id}</p><p className="mt-1 max-w-60 break-all font-mono text-[11px] text-text-secondary">{release.reference}</p></td><td className={td}><p className="whitespace-nowrap text-xs">{formatDateTime(release.release_at)}</p><p className="mt-2 flex items-center gap-1 text-[11px] text-text-secondary"><Clock3 className="h-3 w-3" />{Date.parse(release.release_at) <= Date.now() ? 'Ready for settlement' : 'Currently on hold'}</p></td><td className={td}><button onClick={() => onAction({ type: 'release', release })} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10">Release to main<ArrowRight className="h-3 w-3" /></button></td></tr>)}</tbody></table>
      : <table className="w-full min-w-[800px]"><thead className="bg-muted/35"><tr>{['Action', 'Administrator', 'Target', 'Reason & result', 'Date'].map((label) => <th key={label} className={th}>{label}</th>)}</tr></thead><tbody className="divide-y divide-border">{(items as AdminAudit[]).map((audit) => <tr key={audit.id}><td className={td}><span className="flex items-center gap-2 whitespace-nowrap font-bold"><ShieldCheck className="h-4 w-4 text-primary" />{actionNames[audit.action] || audit.action}</span></td><td className={`${td} text-xs`}>{audit.actor_email}</td><td className={`${td} whitespace-nowrap text-xs`}>{audit.action.includes('user') ? 'User' : audit.action === 'debit_wallet' ? 'Wallet' : 'Settlement'} #{audit.target_id}</td><td className={`${td} max-w-sm`}><p className="break-words text-xs leading-5">{audit.reason}</p><details className="mt-2 text-xs"><summary className="cursor-pointer font-bold text-primary">View result</summary><pre className="mt-2 max-w-80 overflow-x-auto rounded-xl bg-muted p-3 text-[11px]">{JSON.stringify(audit.result, null, 2)}</pre></details></td><td className={`${td} whitespace-nowrap text-xs text-text-secondary`}>{formatDateTime(audit.created_at)}</td></tr>)}</tbody></table>}
    </div>}
    {!compact && <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-text-secondary"><span>{result?.total ? `${offset + 1}–${Math.min(offset + limit, result.total)} of ${result.total.toLocaleString()}` : '0 records'}</span><div className="flex items-center gap-2"><button aria-label="Previous page" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - limit))} className="rounded-lg border border-border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="px-2">Page {Math.floor(offset / limit) + 1}</span><button aria-label="Next page" disabled={loading || !!error || !result || offset + limit >= result.total} onClick={() => setOffset((value) => value + limit)} className="rounded-lg border border-border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>}
  </section>;
}

function UserRows({ user, expanded, onExpand, onAction, td }: { user: AdminUser; expanded: boolean; onExpand: () => void; onAction: (action: AdminAction) => void; td: string }) {
  return <><tr className="hover:bg-muted/20"><td className={td}><Person {...user} /><div className="mt-2 flex gap-2 pl-12"><span className="text-[10px] text-text-secondary">{user.username ? `@${user.username}` : 'No creator profile'}</span>{user.is_admin && <span className="text-[10px] font-bold text-primary">ADMIN</span>}</div></td><td className={td}><StatusPill tone={user.is_blocked ? 'bad' : 'good'}>{user.is_blocked ? 'Blocked' : 'Active'}</StatusPill><p className="mt-2 text-[10px] text-text-secondary">{user.verified ? 'Email verified' : 'Email unverified'}</p></td>{(['USD', 'NGN'] as const).map((currency) => {
    const wallet = user.wallets.find((item) => item.currency === currency);
    return <td key={currency} className={`${td} whitespace-nowrap tabular-nums`}><p className="font-bold">{wallet ? formatCurrency(wallet.balance, currency) : '—'}</p><p className="mt-1 text-[11px] text-text-secondary">{wallet ? `${formatCurrency(wallet.pending_balance, currency)} pending` : 'No wallet'}</p></td>;
  })}<td className={`${td} whitespace-nowrap text-xs text-text-secondary`}>{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td className={td}><button onClick={onExpand} aria-expanded={expanded} className="rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted">{expanded ? 'Close' : 'Manage'}</button></td></tr>{expanded && <tr><td colSpan={6} className="bg-muted/30 px-5 py-5"><div className="flex flex-wrap items-center gap-3"><span className="mr-2 text-xs font-bold">User #{user.id}</span>{user.wallets.map((wallet) => <button key={wallet.id} onClick={() => onAction({ type: 'debit', user, wallet })} disabled={Number(wallet.balance) <= 0} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold hover:border-primary disabled:opacity-40"><Wallet className="h-3.5 w-3.5" />Debit {wallet.currency} wallet</button>)}<button disabled={user.is_admin} onClick={() => onAction({ type: 'block', user })} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-40 ${user.is_blocked ? 'border-success/30 text-success' : 'border-error/30 text-error'}`}><Users className="h-3.5 w-3.5" />{user.is_blocked ? 'Unblock user' : 'Block user'}</button>{user.is_admin && <p className="text-xs text-text-secondary">Admin accounts are protected from blocking.</p>}</div></td></tr>}</>;
}
