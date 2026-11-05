import { ArrowDownLeft, ArrowUpRight, CreditCard, Receipt } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Transaction } from '@/types';
import { isCredit } from '@/lib/money';
import { TransactionDetails } from '@/components/dashboard/TransactionDetails';

const typeIcons = {
  tip: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  payment: CreditCard,
  fee: Receipt,
  admin_debit: ArrowUpRight,
};

const typeLabels = {
  tip: 'Gift',
  withdrawal: 'Withdrawal',
  payment: 'Store sale',
  fee: 'Fee',
  admin_debit: 'Admin debit',
};

const statusVariants = {
  completed: 'success' as const,
  pending: 'warning' as const,
  failed: 'error' as const,
};

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <>
      <ul aria-label="Transaction history" className="divide-y divide-border px-4 sm:px-6 xl:hidden">
        {transactions.map((transaction) => {
          const Icon = typeIcons[transaction.type];
          const incoming = isCredit(transaction.type);
          return (
            <li key={transaction.id} className="py-4 sm:py-5">
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${incoming ? 'bg-success/10 text-success' : 'bg-muted text-text-secondary'}`}><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-extrabold">{typeLabels[transaction.type]}</p>
                    <p className={`break-all text-sm font-black tabular-nums ${incoming ? 'text-success' : 'text-foreground'}`}>{incoming ? '+' : '−'}{formatCurrency(transaction.amount, transaction.currency)}</p>
                  </div>
                  <p className="mt-1 break-words text-xs leading-5 text-text-secondary">{transaction.description || transaction.sender_name || (incoming ? 'Payment received' : transaction.type === 'fee' ? 'Platform fee' : 'Bank payout')}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-text-secondary">{formatDateTime(transaction.createdAt)}</p>
                    <Badge variant={statusVariants[transaction.status]}>{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</Badge>
                  </div>
                  <details className="mt-3 text-xs text-text-secondary">
                    <summary className="w-fit cursor-pointer font-semibold text-primary">Transaction details</summary>
                    <div className="mt-2 space-y-2 rounded-xl bg-muted/50 p-3">
                      {transaction.reference && <p className="break-all"><span className="font-semibold">Reference: </span>{transaction.reference}</p>}
                      {transaction.sender_name && <p className="break-words"><span className="font-semibold">From: </span>{transaction.sender_name}</p>}
                      {transaction.sender_email && <p className="break-all">{transaction.sender_email}</p>}
                      <TransactionDetails transaction={transaction} expanded />
                    </div>
                  </details>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden xl:block">
    <Table className="min-w-[850px]">
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>From</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => {
          const Icon = typeIcons[transaction.type];
          const isIncoming = isCredit(transaction.type);

          return (
            <TableRow key={transaction.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${isIncoming ? 'bg-success/10' : 'bg-error/10'
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isIncoming ? 'text-success' : 'text-error'
                        }`}
                    />
                  </div>
                  <span className="font-medium">{typeLabels[transaction.type]}</span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{transaction.description || typeLabels[transaction.type]}</p>
                <TransactionDetails transaction={transaction} />
              </TableCell>
              <TableCell>
                {transaction.sender_name && (
                  <p className="text-sm text-foreground">{transaction.sender_name}</p>
                )}
                {transaction.sender_email && (
                  <p className="text-xs text-text-secondary">{transaction.sender_email}</p>
                )}
                {!transaction.sender_name && !transaction.sender_email && (
                  <p className="text-xs text-text-secondary">N/A</p>
                )}
              </TableCell>
              <TableCell>
                {transaction.reference ? (
                  <p className="text-xs text-text-secondary font-mono">{transaction.reference}</p>
                ) : (
                  <p className="text-xs text-text-secondary">N/A</p>
                )}
              </TableCell>
              <TableCell className="text-sm text-text-secondary">
                {formatDateTime(transaction.createdAt)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[transaction.status]}>
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-medium ${isIncoming ? 'text-success' : 'text-foreground'
                    }`}
                >
                  {isIncoming ? '+' : '-'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
      </div>
    </>
  );
}
