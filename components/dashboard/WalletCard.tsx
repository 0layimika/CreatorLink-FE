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
  wallets: Array<{ balance: number; pending_balance: number; currency: string }>;
  bankAccount?: BankAccount | null;
  onAddBank?: () => void;
  onEditBank?: () => void;
  onWithdraw?: () => void;
}

export function WalletCard({ wallets, bankAccount, onAddBank, onEditBank, onWithdraw }: WalletCardProps) {
  const balances = ['NGN', 'USD'].map((currency) => wallets.find((wallet) => wallet.currency === currency) ?? { currency, balance: 0, pending_balance: 0 });
  const hasBank = Boolean(bankAccount?.account_number);

  return (
    <Card className="min-w-0 rounded-[24px] border-ink bg-ink p-4 text-white shadow-[4px_4px_0_var(--secondary)] sm:rounded-[28px] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">Your money</p>
          <h2 className="mt-1 font-display text-xl font-black tracking-[-0.035em] sm:text-2xl">Wallet balances</h2>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5">
          <Wallet className="h-5 w-5 text-secondary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {balances.map((item) => (
          <section key={item.currency} aria-label={`${item.currency} wallet balance`} className="min-w-0 rounded-2xl border border-white/12 bg-white/5 p-3 sm:p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-black ${item.currency === 'NGN' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-white'}`}>{item.currency === 'NGN' ? '₦' : '$'}</span>
              <h3 className="text-xs font-black tracking-wide text-white/85">{item.currency}</h3>
            </div>
            <p className="mt-4 text-[10px] font-medium text-white/55 sm:text-xs">Available to withdraw</p>
            <p className="mt-1 break-all font-display text-[clamp(1.2rem,5.5vw,1.6rem)] font-black leading-tight tracking-[-0.045em] tabular-nums sm:text-3xl">{formatCurrency(item.balance, item.currency)}</p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="flex items-center gap-1.5 text-[10px] text-white/55 sm:text-xs"><Clock className="h-3 w-3 shrink-0" />Pending settlement</p>
              <p className="mt-1 break-all text-sm font-bold tabular-nums text-white/85 sm:text-base">{formatCurrency(item.pending_balance, item.currency)}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/55">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>USD inflows take 2–3 business days to settle before they’re available for withdrawal.</p>
      </div>

      <div className="mt-5 border-t border-white/12 pt-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {hasBank && bankAccount ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8"><Building2 className="h-4 w-4 text-white/65" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{bankAccount.bank_name}</p>
              <p className="mt-0.5 truncate text-xs text-white/55">{bankAccount.account_name}</p>
              <p className="mt-0.5 text-xs tracking-wider text-white/55">{bankAccount.account_number.replace(/\d(?=\d{4})/g, '*')}</p>
            </div>
            {onEditBank && <button type="button" onClick={onEditBank} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white" aria-label="Edit bank account"><Edit2 className="h-4 w-4" /></button>}
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8"><Building2 className="h-4 w-4 text-white/65" /></div>
            <div><p className="text-sm font-bold">Connect your bank</p><p className="mt-0.5 text-xs text-white/55">Choose where your payouts go.</p></div>
          </div>
        )}
        {hasBank ? (
          <Button type="button" variant="secondary" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto" disabled={balances.every((item) => item.balance <= 0)} onClick={onWithdraw}><ArrowDownLeft className="h-4 w-4" />Withdraw</Button>
        ) : onAddBank && (
          <Button type="button" variant="secondary" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto" onClick={onAddBank}><ArrowUpRight className="h-4 w-4" />Add bank account</Button>
        )}
      </div>
    </Card>
  );
}
