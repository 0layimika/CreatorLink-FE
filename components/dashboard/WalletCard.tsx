import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Edit2, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface BankAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}

interface WalletCardProps {
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  wallets?: Array<{ balance: number; currency: string }>;
  bankAccount?: BankAccount | null;
  onAddBank?: () => void;
  onEditBank?: () => void;
  onWithdraw?: () => void;
}

export function WalletCard({ balance, wallets, bankAccount, onAddBank, onEditBank, onWithdraw }: WalletCardProps) {
  const balances = wallets?.length ? wallets : [{ balance: balance.available, currency: balance.currency }];
  return (
    <Card className="border-ink bg-ink p-6 text-white shadow-[6px_6px_0_var(--secondary)]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.13em] text-white/55">Available balance</p>
          <div className="mt-3 grid gap-3 grid-cols-1">
            {balances.map((item) => <div key={item.currency} className="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/50">{item.currency} wallet</p><p className="mt-1 font-display text-2xl font-black tracking-[-0.04em] text-white">{formatCurrency(item.balance, item.currency)}</p></div>)}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-primary">
          <Wallet className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-2 text-sm font-bold text-white/60">
        <Clock className="h-4 w-4" />
        <span>
          {formatCurrency(balance.pending, balance.currency)} pending
        </span>
      </div>

      {bankAccount && bankAccount.account_number ? (
        <div className="mb-4 rounded-2xl border border-white/15 bg-white/8 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-secondary" />
              <span className="text-sm font-bold text-white">Bank account</span>
            </div>
            {onEditBank && (
              <button
                onClick={onEditBank}
                className="text-white/55 transition-colors hover:text-secondary"
                aria-label="Edit bank account"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm font-bold text-white">{bankAccount.account_name}</p>
          <p className="text-xs text-white/55">{bankAccount.bank_name}</p>
          <p className="mt-1 text-xs text-white/55">
            {bankAccount.account_number.replace(/\d(?=\d{4})/g, '*')}
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-white/15 bg-white/8 p-4 text-center">
          <p className="mb-2 text-sm text-white/60">No bank account added yet.</p>
          {onAddBank && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddBank}
              className="w-full"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          )}
        </div>
      )}

      <Button
        variant="secondary"
        className="w-full"
        disabled={!bankAccount || balances.every((item) => item.balance <= 0)}
        onClick={onWithdraw}
      >
        <ArrowDownLeft className="h-4 w-4 mr-2" />
        Withdraw
      </Button>
    </Card>
  );
}
