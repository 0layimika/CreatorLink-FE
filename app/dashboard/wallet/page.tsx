'use client';

import { useState } from 'react';
import { Banknote, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { BankAccountForm } from '@/components/dashboard/BankAccountForm';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';
import { DashboardLoading, DashboardPageHeader } from '@/components/dashboard/DashboardUI';

export default function WalletPage() {
  const { wallet, transactions, banks, bankAccount, isLoading, setBankAccount, resolveAccount, loadBanks, withdraw } = useWallet();
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (isLoading) {
    return <DashboardLoading label="Counting your money…" />;
  }

  const walletBalance = {
    available: wallet?.balance || 0,
    pending: wallet?.pending || 0,
    currency: wallet?.currency || 'NGN',
  };
  const walletBalances = wallet?.wallets || [{ balance: walletBalance.available, currency: walletBalance.currency }];

  // Transform transactions to match the expected format
  const formattedTransactions = (transactions || []).map((t) => ({
    id: t.id,
    type: t.type as 'tip' | 'withdrawal' | 'payment',
    amount: t.amount,
    currency: t.currency,
    description: t.description,
    status: t.status as 'completed' | 'pending' | 'failed',
    createdAt: t.createdAt,
    reference: t.reference,
    sender_name: t.sender_name,
    sender_email: t.sender_email,
  }));

  // Calculate this month's earnings (only completed transactions)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTransactions = (transactions || [])
    .filter((t) => {
      const date = new Date(t.createdAt);
      return date >= startOfMonth &&
        (t.type === 'tip' || t.type === 'payment') &&
        t.status === 'completed';
    });
  const thisMonthEarnings = (currency: string) => thisMonthTransactions.filter((t) => t.currency === currency).reduce((sum, t) => sum + t.amount, 0);

  // Count total tips
  const totalTips = (transactions || []).filter((t) => t.type === 'tip').length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow="Money" title="Wallet" description="See what came in, what is pending and where your payouts are going." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletCard
            balance={walletBalance}
            wallets={walletBalances}
            bankAccount={bankAccount}
            onAddBank={() => { void loadBanks(); setIsBankFormOpen(true); }}
            onEditBank={() => { void loadBanks(); setIsBankFormOpen(true); }}
            onWithdraw={() => setIsWithdrawOpen(true)}
          />
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-text-secondary"><Banknote className="h-4 w-4 text-secondary-foreground" />Earned this month</div><div className="mt-3 space-y-1">{(['NGN', 'USD'] as const).map((currency) => <p key={currency} className="text-xl font-black tracking-tight text-foreground">{formatCurrency(thisMonthEarnings(currency), currency)}</p>)}</div><p className="mt-2 text-xs font-semibold text-text-secondary">Completed gifts and sales</p></div>
          <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-text-secondary"><Gift className="h-4 w-4 text-primary" />Gifts received</div><p className="mt-3 text-2xl font-black tracking-tight text-foreground">{totalTips}</p><p className="mt-1 text-xs font-semibold text-text-secondary">All time</p></div>
        </div>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {formattedTransactions && formattedTransactions.length > 0 ? (
            <TransactionTable transactions={formattedTransactions} />
          ) : (
            <p className="text-text-secondary text-center py-8">
              No transactions yet. Share your profile to start receiving tips.
            </p>
          )}
        </CardContent>
      </Card>

      <BankAccountForm
        isOpen={isBankFormOpen}
        onClose={() => setIsBankFormOpen(false)}
        onSave={async (data) => {
          await setBankAccount(data);
          setIsBankFormOpen(false);
        }}
        onResolveAccount={resolveAccount}
        banks={banks}
        existingAccount={bankAccount}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={async (amount, currency, password) => {
          await withdraw(amount, currency, password);
          setIsWithdrawOpen(false);
        }}
        wallets={walletBalances.map((item) => ({ currency: item.currency as 'NGN' | 'USD', balance: item.balance }))}
      />
    </div>
  );
}
