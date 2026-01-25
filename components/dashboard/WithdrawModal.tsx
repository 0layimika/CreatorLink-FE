'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => Promise<void>;
  availableBalance: number;
  currency: string;
  minimumAmount?: number;
}

export function WithdrawModal({
  isOpen,
  onClose,
  onWithdraw,
  availableBalance,
  currency,
  minimumAmount = 1000,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      await onWithdraw(withdrawAmount);
      setAmount('');
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

        <h2 className="text-xl font-bold text-foreground mb-6">Withdraw Funds</h2>

        <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border">
          <p className="text-sm text-text-secondary mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(availableBalance, currency)}
          </p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <Input
            type="number"
            label="Amount"
            placeholder={`Enter amount (min: ${formatCurrency(minimumAmount, currency)})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minimumAmount}
            max={availableBalance}
            required
            disabled={isLoading}
          />

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) < minimumAmount || parseFloat(amount) > availableBalance}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

