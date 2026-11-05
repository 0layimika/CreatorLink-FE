'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck, X } from 'lucide-react';
import type { AdminRelease, AdminUser } from '@/types/admin';
import type { Wallet } from '@/types/wallet';
import { adminApi } from '@/lib/admin-api';
import { formatCurrency } from '@/lib/utils';
import { isMoneyInput, validMoneyAmount } from '@/lib/money';
import { ApiError } from '@/lib/api';

export type AdminAction = { type: 'block'; user: AdminUser } | { type: 'debit'; user: AdminUser; wallet: Wallet } | { type: 'release'; release: AdminRelease };

export function AdminActionDialog({ action, onClose, onSuccess }: { action: AdminAction; onClose: () => void; onSuccess: (message: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef<string | null>(null);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState('');
  const blocking = action.type === 'block' && !action.user.is_blocked;
  const title = action.type === 'debit' ? 'Debit wallet' : action.type === 'release' ? 'Release pending funds' : blocking ? 'Block user' : 'Unblock user';
  const owner = action.type === 'release' ? action.release.email : action.user.email;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (reason.trim().length < 5) { setError('Add a reason of at least 5 characters.'); return; }
    if (action.type === 'debit' && (!validMoneyAmount(amount) || Number(amount) > Number(action.wallet.balance))) {
      setError('Enter an amount within the main balance, with at most two decimal places.'); return;
    }
    setBusy(true);
    setError('');
    requestId.current ??= crypto.randomUUID();
    const body = { request_id: requestId.current, reason: reason.trim() };
    try {
      let message = '';
      if (action.type === 'block') {
        await adminApi.block(action.user.id, { ...body, blocked: !action.user.is_blocked });
        message = `${owner} ${blocking ? 'blocked' : 'unblocked'}.`;
      } else if (action.type === 'debit') {
        const result = await adminApi.debit(action.wallet.id, { ...body, amount });
        message = `${formatCurrency(amount, action.wallet.currency)} debited. Transaction ${result.data?.reference || 'created'}.`;
      } else {
        const result = await adminApi.release(action.release.id, body);
        message = result.data?.already_released ? 'This settlement was already released. No funds moved twice.' : `${formatCurrency(action.release.amount, action.release.currency)} moved to the main balance.`;
      }
      onSuccess(message);
    } catch (err) {
      // Retain the key and payload when the server outcome is unknown; retry is safe.
      const unknown = !(err instanceof ApiError) || err.status >= 500;
      setUncertain(unknown);
      if (!unknown) requestId.current = null;
      setError(`${err instanceof Error ? err.message : 'Could not complete action.'}${unknown ? ' The outcome is unconfirmed. Retry this exact request safely, or check the audit log before starting another action.' : ''}`);
    } finally { setBusy(false); }
  }

  return <dialog ref={dialog} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="admin-action-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/55">
    <form onSubmit={submit} className="p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div><button type="button" aria-label="Close dialog" disabled={busy} onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button></div>
      <h2 id="admin-action-title" className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 break-all text-sm text-text-secondary">{owner}</p>
      <div className="my-5 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-6">
        {action.type === 'debit' ? <>Main balance: <strong>{formatCurrency(action.wallet.balance, action.wallet.currency)}</strong><p>The debit creates a completed transaction and updates the wallet together.</p></> : action.type === 'release' ? <><strong>{formatCurrency(action.release.amount, action.release.currency)}</strong> will move from pending to main now, ahead of the scheduled release if necessary.<p className="mt-2 break-all text-xs">{action.release.reference}</p></> : blocking ? 'This user will lose access immediately and their public profile will be hidden. Their wallet funds stay recorded.' : 'This user will regain account access and their public profile will be visible again.'}
      </div>
      {action.type === 'debit' && <label className="mb-4 block text-sm font-bold">Amount ({action.wallet.currency})<input autoFocus inputMode="decimal" value={amount} disabled={busy || uncertain} onChange={(event) => { if (isMoneyInput(event.target.value)) setAmount(event.target.value); }} placeholder="0.00" required className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>}
      <label className="block text-sm font-bold">Reason<textarea autoFocus={action.type !== 'debit'} value={reason} disabled={busy || uncertain} onChange={(event) => setReason(event.target.value)} required minLength={5} maxLength={500} rows={3} placeholder="Explain why you’re making this change…" className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
      <p className="mt-2 text-xs text-text-secondary">Your account, reason, and result are saved in the audit log.</p>
      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-error/10 p-3 text-sm text-error"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      <div className="mt-7 flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-border px-4 py-3 text-sm font-bold disabled:opacity-50">Cancel</button><button type="submit" disabled={busy} className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-50 ${blocking || action.type === 'debit' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-hover'}`}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{busy ? 'Processing…' : uncertain ? 'Retry safely' : title}</button></div>
    </form>
  </dialog>;
}
