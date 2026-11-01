'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError, walletApi } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { isMoneyInput, validMoneyAmount } from '@/lib/money';
import { findWithdrawal, quoteIsCurrent } from '@/lib/withdrawals';
import type { Currency, WithdrawalQuote, WithdrawalResult } from '@/types/wallet';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onHasOutcomeChange: (hasOutcome: boolean) => void;
  onAddBank: () => void;
  bankKey: string;
  hasBank: boolean;
  wallets: Array<{ balance: number; currency: Currency }>;
  recoveryKey: string;
}

type Outcome = { quote: WithdrawalQuote; result?: WithdrawalResult; uncertain: boolean };

export function WithdrawModal({ isOpen, onClose, onRefresh, onHasOutcomeChange, onAddBank, bankKey, hasBank, wallets, recoveryKey }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'amount' | 'review' | 'password'>('amount');
  const [quote, setQuote] = useState<WithdrawalQuote | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [pollRound, setPollRound] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pollFinished, setPollFinished] = useState(false);
  const requestVersion = useRef(0);
  const quoteRequest = useRef<AbortController | null>(null);
  const sending = useRef(false);
  const refreshRef = useRef(onRefresh);
  const bankRef = useRef(bankKey);
  const outcomeRef = useRef(outcome);
  const hasOutcome = outcome !== null;
  useEffect(() => { onHasOutcomeChange(hasOutcome); }, [hasOutcome, onHasOutcomeChange]);
  useEffect(() => { refreshRef.current = onRefresh; }, [onRefresh]);
  useEffect(() => { outcomeRef.current = outcome; }, [outcome]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(recoveryKey);
      if (saved) {
        const recovery: Outcome = JSON.parse(saved);
        if (recovery.quote?.quote_id && (recovery.uncertain || recovery.result?.status === 'pending')) setOutcome(recovery);
      }
    } catch { /* Recovery storage is optional. */ }
  }, [recoveryKey]);

  const remember = (value: Outcome | null) => {
    outcomeRef.current = value;
    setOutcome(value);
    try {
      if (value && (value.uncertain || value.result?.status === 'pending')) sessionStorage.setItem(recoveryKey, JSON.stringify(value));
      else sessionStorage.removeItem(recoveryKey);
    } catch { /* Keep recovery in memory if browser storage is unavailable. */ }
  };
  const rememberRef = useRef(remember);
  useEffect(() => { rememberRef.current = remember; });

  const invalidate = useCallback(() => {
    requestVersion.current += 1;
    quoteRequest.current?.abort();
    setQuote(null);
    setPassword('');
    setStep('amount');
    setError(null);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (bankRef.current !== bankKey) {
      bankRef.current = bankKey;
      // An in-flight payout keeps its original quote and bank for recovery.
      if (!outcomeRef.current && !sending.current) invalidate();
    }
  }, [bankKey, invalidate]);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      if (!outcomeRef.current && !sending.current) invalidate();
    }
  }, [isOpen, invalidate]);

  useEffect(() => {
    if (!quote || outcome) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [quote, outcome]);

  useEffect(() => () => { quoteRequest.current?.abort(); }, []);

  const unresolved = outcome?.uncertain || outcome?.result?.status === 'pending';
  const identity = unresolved && outcome ? `${outcome.quote.quote_id}:${outcome.result?.reference ?? ''}` : null;
  useEffect(() => {
    if (!identity || busy) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let canceled = false;
    let attempts = 0;
    setChecked(false);
    setPollFinished(false);
    const check = async () => {
      setChecking(true);
      try {
        const current = outcomeRef.current;
        if (!current) return;
        const row = await findWithdrawal({ quote_id: current.quote.quote_id, transaction_id: current.result?.transaction_id, reference: current.result?.reference }, controller.signal);
        if (canceled) return;
        setChecked(true);
        if (row) {
          const result: WithdrawalResult = { ...current.quote, transaction_id: row.id, reference: row.reference, status: row.status };
          rememberRef.current({ quote: current.quote, result, uncertain: false });
          setError(null);
          void refreshRef.current();
          if (row.status !== 'pending') return;
        }
      } catch (err) {
        if (!canceled) setError(err instanceof Error ? err.message : 'Could not check withdrawal status.');
      } finally {
        if (!canceled) setChecking(false);
      }
      if (canceled) return;
      attempts += 1;
      if (attempts < 7) timer = setTimeout(check, Math.min(2000 * 2 ** attempts, 30000));
      else setPollFinished(true);
    };
    void check();
    return () => { canceled = true; controller.abort(); clearTimeout(timer); };
  }, [identity, pollRound, busy]);

  const availableBalance = wallets.find((entry) => entry.currency === currency)?.balance ?? 0;
  const minimum = currency === 'USD' ? 1 : 1000;
  const value = validMoneyAmount(amount);
  const remaining = quote && now !== null ? Math.max(0, Math.ceil((Date.parse(quote.expires_at) - now) / 1000)) : 0;
  const expired = !quote || now === null || !quoteIsCurrent(quote.expires_at, now);
  const canQuote = value !== null && value >= minimum && hasBank;

  const requestQuote = async () => {
    if (sending.current || !canQuote) return;
    invalidate();
    const version = requestVersion.current;
    const controller = new AbortController();
    quoteRequest.current = controller;
    setBusy(true);
    try {
      const response = await walletApi.quoteWithdrawal(value, currency, controller.signal);
      if (version !== requestVersion.current) return;
      if (!response.data) throw new Error('Could not create a withdrawal quote.');
      setQuote(response.data);
      setNow(Date.now());
      setStep('review');
    } catch (err) {
      if (version === requestVersion.current && !controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not create a withdrawal quote.');
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  };

  const execute = async (event: React.FormEvent) => {
    event.preventDefault();
    const activeQuote = outcome?.uncertain ? outcome.quote : quote;
    if (sending.current || !activeQuote || !password) return;
    if (!outcome?.uncertain && !quoteIsCurrent(activeQuote.expires_at)) {
      setNow(Date.now());
      setPassword('');
      setError('This quote is too close to expiry. Refresh it and review the new figures.');
      return;
    }
    if (!outcome?.uncertain && !activeQuote.sufficient_balance) return;
    if (outcome?.uncertain && (!checked || checking)) return;
    sending.current = true;
    setBusy(true);
    setError(null);
    const accountPassword = password;
    setPassword('');
    // Save the quote before sending; a reload or lost response must not start a new payout.
    const previousOutcome = outcome;
    remember({ quote: activeQuote, uncertain: true });
    setChecked(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await walletApi.withdraw(activeQuote.quote_id, accountPassword, controller.signal);
      if (!response.data) throw new Error('The withdrawal response was incomplete. Checking history for its status.');
      remember({ quote: activeQuote, result: response.data, uncertain: false });
      setStep('review');
    } catch (err) {
      const definitiveRejection = err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 408;
      // A prior uncertain attempt may still exist even when this retry is rejected.
      if (definitiveRejection && !previousOutcome?.uncertain) remember(null);
      setError(controller.signal.aborted ? 'The request timed out. Checking withdrawal history before another attempt.' : err instanceof Error ? err.message : 'The withdrawal response was interrupted. Checking history before another attempt.');
      setPollRound((round) => round + 1);
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
      setBusy(false);
      void refreshRef.current();
    }
  };

  const close = () => {
    if (sending.current) return;
    setPassword('');
    if (!unresolved) { remember(null); invalidate(); setAmount(''); }
    onClose();
  };

  if (!isOpen) return null;
  const displayQuote = outcome?.quote ?? quote;
  const terminal = outcome?.result?.status === 'completed' || outcome?.result?.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="withdraw-title" className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-soft">
        <button type="button" aria-label="Close withdrawal" onClick={close} disabled={busy} className="absolute right-4 top-4 text-text-secondary disabled:opacity-50"><X className="h-5 w-5" /></button>
        <h2 id="withdraw-title" className="mb-2 text-xl font-black">Withdraw funds</h2>
        <p className="mb-5 text-sm text-text-secondary">{outcome ? 'Withdrawal status' : step === 'amount' ? 'Choose an amount to get a quote.' : step === 'review' ? 'Review your quote before confirming.' : 'Confirm the reviewed quote with your password.'}</p>

        {!outcome && step === 'amount' && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">{(['NGN', 'USD'] as const).map((item) => <button type="button" disabled={busy} key={item} onClick={() => { invalidate(); setCurrency(item); setAmount(''); }} className={`rounded-xl border p-3 text-left ${currency === item ? 'border-primary bg-primary/10' : 'border-border'}`}><p className="text-xs font-black">{item} wallet</p><p className="mt-1 font-bold">{formatCurrency(wallets.find((wallet) => wallet.currency === item)?.balance ?? 0, item)}</p><p className="mt-1 text-xs text-text-secondary">Available to withdraw</p></button>)}</div>
          <Input label={`Amount (${currency})`} inputMode="decimal" value={amount} disabled={busy} onChange={(event) => { if (isMoneyInput(event.target.value)) { invalidate(); setAmount(event.target.value); } }} helperText={`Minimum ${formatCurrency(minimum, currency)}. The quoted fee is added to your wallet debit.`} error={amount && (value === null || value < minimum) ? `Enter at least ${formatCurrency(minimum, currency)}, with up to two decimal places.` : undefined} />
          <p className="text-xs text-text-secondary">Available balance: {formatCurrency(availableBalance, currency)}. Pending funds cannot be withdrawn.</p>
          {!hasBank && <div className="rounded-xl border border-border p-4"><p className="mb-3 text-sm">Add your Nigerian bank account to receive withdrawals from either wallet.</p><Button type="button" onClick={onAddBank}>Add bank account</Button></div>}
          <Button type="button" className="w-full" disabled={!canQuote} isLoading={busy} onClick={() => void requestQuote()}>Get withdrawal quote</Button>
        </div>}

        {displayQuote && <div className="space-y-4">
          <dl className="space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            {[
              ['Withdrawal amount', formatCurrency(displayQuote.amount, displayQuote.currency)],
              ['Withdrawal fee', formatCurrency(displayQuote.fee, displayQuote.fee_currency)],
              ['Total wallet debit', formatCurrency(displayQuote.total_debit, displayQuote.currency)],
              ['You receive in your bank', formatCurrency(displayQuote.receive_amount, displayQuote.receive_currency)],
            ].map(([label, amount]) => <div key={label} className="flex justify-between gap-3"><dt className="text-text-secondary">{label}</dt><dd className="text-right font-bold">{amount}</dd></div>)}
            {displayQuote.exchange_rate !== null && <div className="flex justify-between gap-3"><dt className="text-text-secondary">Exchange rate</dt><dd className="text-right font-bold">1 {displayQuote.currency} = {String(displayQuote.exchange_rate)} {displayQuote.receive_currency}</dd></div>}
          </dl>
          <div className="rounded-xl border border-border p-4 text-sm"><p className="font-bold">{displayQuote.bank_account.bank_name}</p><p className="text-text-secondary">{displayQuote.bank_account.account_name} · ****{displayQuote.bank_account.account_last_four}</p></div>
          {!outcome && <>
            <p className="text-xs text-text-secondary">Quote expires {formatDateTime(displayQuote.expires_at)} · {expired ? 'Expired or too close to expiry' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} remaining`}</p>
            {!displayQuote.sufficient_balance && <p role="alert" className="text-sm text-error">Your available balance does not cover the amount plus fee. Pending funds do not count.</p>}
            {expired ? <Button type="button" className="w-full" isLoading={busy} onClick={() => void requestQuote()}>Refresh quote</Button> : step === 'review' && <Button type="button" className="w-full" disabled={!displayQuote.sufficient_balance || busy} onClick={() => { setStep('password'); setError(null); }}>Continue to password confirmation</Button>}
            <Button type="button" variant="outline" disabled={busy} onClick={invalidate}>Edit amount or currency</Button>
          </>}
        </div>}

        {outcome && <div className="mt-5 space-y-3" aria-live="polite">
          <p className={`font-bold ${outcome.result?.status === 'failed' ? 'text-error' : 'text-foreground'}`}>{outcome.result?.status === 'completed' ? 'Withdrawal completed' : outcome.result?.status === 'failed' ? 'Withdrawal failed' : outcome.uncertain ? 'Confirming withdrawal status' : 'Withdrawal processing'}</p>
          <p className="text-sm text-text-secondary">{outcome.result?.status === 'completed' ? 'Your payout has completed.' : outcome.result?.status === 'failed' ? 'The backend refunds the amount and fee to your available balance. Your wallet has been refreshed.' : outcome.uncertain ? 'The response was uncertain. We’re checking history for this quote. A missing entry does not mean the withdrawal failed.' : 'The amount plus fee has been debited. Bank delivery is still processing.'}</p>
          {outcome.result?.reference && <p className="break-all text-xs text-text-secondary">Reference: {outcome.result.reference}</p>}
          {unresolved && <><p className="text-xs text-text-secondary">{checking ? 'Checking withdrawal history…' : pollFinished ? 'Automatic checks paused. Check again for an update.' : 'Status checks continue in the background.'}</p><Button type="button" variant="outline" disabled={busy || checking} onClick={() => { setChecked(false); setPollRound((round) => round + 1); }}>Check status</Button></>}
          {outcome.uncertain && checked && !checking && !busy && <p className="text-xs text-text-secondary">You can confirm again using this same quote. The backend reuses any existing payout.</p>}
          {terminal && <Button type="button" className="w-full" onClick={close}>Done</Button>}
        </div>}

        {((!outcome && step === 'password' && !expired) || (outcome?.uncertain && checked && !checking)) && <form onSubmit={execute} className="mt-5 space-y-4">
          <Input type="password" label="Account password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
          <Button type="submit" className="w-full" disabled={!password || (!outcome && !quote?.sufficient_balance)} isLoading={busy}>{outcome ? 'Confirm again with the same quote' : 'Confirm withdrawal'}</Button>
          {!outcome && <Button type="button" variant="ghost" disabled={busy} onClick={() => { setPassword(''); setStep('review'); }}>Back to quote</Button>}
        </form>}
        {error && <div role="alert" className="mt-4 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">{error}{!outcome && quote && <Button type="button" variant="ghost" className="mt-2" disabled={busy} onClick={() => void requestQuote()}>Get a fresh quote to review</Button>}</div>}
      </section>
    </div>
  );
}
