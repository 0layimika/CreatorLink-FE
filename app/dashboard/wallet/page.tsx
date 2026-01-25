'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { BankAccountForm } from '@/components/dashboard/BankAccountForm';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { useWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/lib/utils';

export default function WalletPage() {
  const { wallet, transactions, banks, bankAccount, isLoading, setBankAccount, resolveAccount, withdraw } = useWallet();
  const [isBankFormOpen, setIsBankFormOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const walletBalance = {
    available: wallet?.balance || 0,
    pending: wallet?.pending || 0,
    currency: wallet?.currency || 'NGN',
  };

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
  const thisMonthEarnings = (transactions || [])
    .filter((t) => {
      const date = new Date(t.createdAt);
      return date >= startOfMonth &&
        (t.type === 'tip' || t.type === 'payment') &&
        t.status === 'completed';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Count total tips
  const totalTips = (transactions || []).filter((t) => t.type === 'tip').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-text-secondary mt-1">
          Manage your earnings and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WalletCard
            balance={walletBalance}
            bankAccount={bankAccount}
            onAddBank={() => setIsBankFormOpen(true)}
            onEditBank={() => setIsBankFormOpen(true)}
            onWithdraw={() => setIsWithdrawOpen(true)}
          />
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-secondary">This Month</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(thisMonthEarnings)}
                  </p>
                  <p className="text-sm text-success mt-1">From tips & payments</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Tips</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalTips}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    All time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
        onWithdraw={async (amount) => {
          await withdraw(amount);
          setIsWithdrawOpen(false);
        }}
        availableBalance={walletBalance.available}
        currency={walletBalance.currency}
        minimumAmount={1000}
      />
    </div>
  );
}
