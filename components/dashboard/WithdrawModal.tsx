'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, currency: 'NGN' | 'USD', password: string) => Promise<void>;
  wallets: Array<{ balance: number; currency: 'NGN' | 'USD' }>;
}

export function WithdrawModal({
  isOpen,
  onClose,
  onWithdraw,
  wallets,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  useEffect(() => { if (isOpen) { setStep(1); setAmount(''); setPassword(''); setError(null); } }, [isOpen]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedWallet = wallets.find((wallet) => wallet.currency === currency);
  const availableBalance = selectedWallet?.balance || 0;
  const minimumAmount = currency === 'USD' ? 1 : 1000;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (!amount || isNaN(withdrawAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < minimumAmount) {
      setError(`Minimum withdrawal amount is ${formatCurrency(minimumAmount, currency)}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (!password) { setError('Enter your password to confirm this withdrawal'); return; }
      await onWithdraw(withdrawAmount, currency, password);
      setAmount('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [
    minimumAmount,
    Math.min(10000, availableBalance),
    Math.min(25000, availableBalance),
    Math.min(50000, availableBalance),
  ].filter((amt, index, arr) => amt >= minimumAmount && (index === 0 || amt !== arr[index - 1]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-soft w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-foreground transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-2">Withdraw Funds</h2>
        <p className="mb-6 text-sm text-text-secondary">Step {step} of 3</p>

        <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border">
          {step === 1 ? <><p className="text-sm font-semibold text-text-secondary">Which wallet are you withdrawing from?</p><div className="mt-3 grid gap-3">{(['NGN', 'USD'] as const).map((walletCurrency) => { const wallet = wallets.find((item) => item.currency === walletCurrency); return <button key={walletCurrency} type="button" onClick={() => { setCurrency(walletCurrency); setAmount(''); setStep(2); }} className={`rounded-xl border p-4 text-left transition ${currency === walletCurrency ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}><p className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">{walletCurrency} wallet</p><p className="mt-1 text-xl font-black">{formatCurrency(wallet?.balance ?? 0, walletCurrency)}</p></button>; })}</div></> : <><p className="text-sm text-text-secondary mb-1">Available balance</p><p className="text-2xl font-bold text-foreground">{formatCurrency(availableBalance, currency)}</p></>}
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          {step === 2 && <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                disabled={isLoading || preset > availableBalance}
                className={`p-3 rounded-lg border text-center font-medium transition-all ${
                  amount === preset.toString()
                    ? 'border-primary bg-primary/10 text-primary shadow-soft'
                    : preset > availableBalance
                    ? 'border-border/50 text-text-secondary opacity-50 cursor-not-allowed'
                    : 'border-border text-foreground hover:border-primary/50'
                }`}
              >
                {formatCurrency(preset, currency)}
              </button>
            ))}
          </div>}

          {step === 2 && <Input
            type="number"
            label="Amount"
            placeholder={`Enter amount (min: ${formatCurrency(minimumAmount, currency)})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minimumAmount}
            max={availableBalance}
            required
            disabled={isLoading}
          />}

          {step === 3 && <>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">You’re withdrawing</p>
              <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(parseFloat(amount) || 0, currency)}</p>
              <p className="mt-1 text-sm text-text-secondary">from your {currency} wallet</p>
            </div>
            <Input type="password" label="Password" placeholder="Enter your password to confirm" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} />
          </>}

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {step === 2 && <>
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading} className="flex-1">Back</Button>
              <Button type="button" onClick={() => setStep(3)} disabled={!amount || parseFloat(amount) < minimumAmount || parseFloat(amount) > availableBalance} className="flex-1">Continue</Button>
            </>}
            {step === 3 && <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>}
            {step === 3 && <Button type="submit" disabled={isLoading || !amount || !password || parseFloat(amount) < minimumAmount || parseFloat(amount) > availableBalance} className="flex-1">
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : 'Withdraw'}
            </Button>}
          </div>
        </form>
      </div>
    </div>
  );
}
