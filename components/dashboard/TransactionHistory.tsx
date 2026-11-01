'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { walletApi } from '@/lib/api';
import { mapTransaction } from '@/lib/money';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import type { Transaction } from '@/types';
import type { TransactionType } from '@/types/wallet';

const pageSize = 50;

export function TransactionHistory({ refreshKey }: { refreshKey: number }) {
  const [filter, setFilter] = useState<TransactionType | ''>('');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const focus = () => setReload((value) => value + 1);
    window.addEventListener('focus', focus);
    return () => window.removeEventListener('focus', focus);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(null);
    const load = async () => {
      try {
        const params = { limit: pageSize, offset };
        const response = filter === 'withdrawal'
          ? await walletApi.getWithdrawals(params, controller.signal)
          : await walletApi.getTransactions({ ...params, type: filter || undefined }, controller.signal);
        if (!active) return;
        if (!Array.isArray(response.data)) throw new Error('Could not load transaction history.');
        setRows(response.data.map(mapTransaction));
        setHasNext(response.data.length === pageSize);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Could not load transaction history.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; controller.abort(); };
  }, [filter, offset, reload, refreshKey]);

  return (
    <div>
      <div className="flex items-end justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 sm:max-w-60"><Select aria-label="Transaction type" value={filter} className="h-11 rounded-xl text-sm" disabled={loading} onChange={(event) => { setFilter(event.target.value as TransactionType | ''); setOffset(0); }} options={[{ label: 'All transactions', value: '' }, { label: 'Gifts', value: 'gift' }, { label: 'Store sales', value: 'store' }, { label: 'Withdrawals', value: 'withdrawal' }, { label: 'Fees', value: 'fee' }]} /></div>
        <Button type="button" aria-label="Refresh history" variant="outline" className="h-11 w-11 shrink-0 p-0 sm:w-auto sm:px-4" disabled={loading} onClick={() => setReload((value) => value + 1)}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span></Button>
      </div>
      {error ? <div role="alert" className="p-5 text-sm text-error">{error}</div> : loading ? <p role="status" className="p-8 text-center text-sm text-text-secondary">Loading transactions…</p> : rows.length ? <TransactionTable transactions={rows} /> : <p className="p-8 text-center text-sm text-text-secondary">No transactions on this page.</p>}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-6">
        <p className="text-xs text-text-secondary">Page {Math.floor(offset / pageSize) + 1}</p>
        <div className="flex gap-2"><Button type="button" variant="outline" size="sm" aria-label="Previous page" className="h-9 gap-1 px-3 text-xs" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - pageSize))}><ChevronLeft className="h-3.5 w-3.5" />Previous</Button><Button type="button" variant="outline" size="sm" aria-label="Next page" className="h-9 gap-1 px-3 text-xs" disabled={loading || !hasNext || Boolean(error)} onClick={() => setOffset((value) => value + pageSize)}>Next<ChevronRight className="h-3.5 w-3.5" /></Button></div>
      </div>
    </div>
  );
}
