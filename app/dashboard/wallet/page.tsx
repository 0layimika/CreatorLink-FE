'use client';

import { useState } from 'react';
import { Banknote, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { BankAccountForm } from '@/components/dashboard/BankAccountForm';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';
import { DashboardError, DashboardLoading, DashboardPageHeader } from '@/components/dashboard/DashboardUI';
import { Button } from '@/components/ui/Button';

export default function WalletPage() {
  const { wallet, transactions, banks, bankAccount, isLoading, setBankAccount, resolveAccount, loadBanks, refetch, error } = useWallet();
  const { user } = useAuth();
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [resumeWithdrawal, setResumeWithdrawal] = useState(false);
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [hasWithdrawalOutcome, setHasWithdrawalOutcome] = useState(false);

  if (isLoading) {
    return <DashboardLoading label="Counting your money…" />;
  }

  const walletBalances = wallet?.wallets ?? [];
  const refreshMoney = async () => {
    await refetch();
    setHistoryRefresh((value) => value + 1);
  };

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
  const totalTips = (transactions || []).filter((t) => t.type === 'tip' && t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader eyebrow="Money" title="Wallet" description="See what came in, what is pending and where your payouts are going." />

      {error && <DashboardError message={error} onRetry={() => void refreshMoney()} />}
      {hasWithdrawalOutcome && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"><p className="text-sm text-text-secondary">Your latest withdrawal status is available.</p><Button type="button" variant="outline" onClick={() => setIsWithdrawOpen(true)}>View withdrawal status</Button></div>}
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)] xl:gap-6">
        <div className="min-w-0">
          <WalletCard
            wallets={walletBalances}
            bankAccount={bankAccount}
            onAddBank={() => { void loadBanks(); setIsBankFormOpen(true); }}
            onEditBank={() => { void loadBanks(); setIsBankFormOpen(true); }}
            onWithdraw={() => setIsWithdrawOpen(true)}
          />
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-1 xl:gap-4">
          <section className="min-w-0 rounded-[24px] border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-text-secondary"><Banknote className="h-4 w-4 shrink-0" /><h2 className="text-xs font-bold sm:text-sm">Recent earnings</h2></div>
            <div className="space-y-2">{(['NGN', 'USD'] as const).map((currency) => <p key={currency} className="break-all text-lg font-black tracking-tight tabular-nums sm:text-2xl">{formatCurrency(thisMonthEarnings(currency), currency)}</p>)}</div>
            <p className="mt-3 text-[11px] leading-4 text-text-secondary">Gross this month, from your latest 10 transactions.</p>
          </section>
          <section className="flex min-w-0 flex-col rounded-[24px] border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-text-secondary"><Gift className="h-4 w-4 shrink-0" /><h2 className="text-xs font-bold sm:text-sm">Gifts received</h2></div>
            <p className="text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{totalTips}</p>
            <p className="mt-auto pt-3 text-[11px] leading-4 text-text-secondary">From your latest 10 transactions.</p>
          </section>
        </div>
      </div>
      <Card className="min-w-0 rounded-[24px] p-0 shadow-soft sm:rounded-[28px]">
        <CardHeader className="px-4 pb-0 pt-5 sm:px-6 sm:pt-6">
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionHistory refreshKey={historyRefresh} />
        </CardContent>
      </Card>

      <BankAccountForm
        isOpen={isBankFormOpen}
        onClose={() => { setIsBankFormOpen(false); if (resumeWithdrawal) { setResumeWithdrawal(false); setIsWithdrawOpen(true); } }}
        onSave={async (data) => {
          await setBankAccount(data);
          setIsBankFormOpen(false);
          if (resumeWithdrawal) { setResumeWithdrawal(false); setIsWithdrawOpen(true); }
        }}
        onResolveAccount={resolveAccount}
        banks={banks}
        existingAccount={bankAccount}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onRefresh={refreshMoney}
        onHasOutcomeChange={setHasWithdrawalOutcome}
        hasBank={Boolean(bankAccount?.account_number)}
        bankKey={bankAccount ? `${bankAccount.id}:${bankAccount.bank_code}:${bankAccount.account_number}:${bankAccount.account_name}` : ''}
        onAddBank={() => { setIsWithdrawOpen(false); setResumeWithdrawal(true); void loadBanks(); setIsBankFormOpen(true); }}
        recoveryKey={`withdrawal-recovery:${user?.id ?? 'creator'}`}
        wallets={walletBalances}
      />
    </div>
  );
}
