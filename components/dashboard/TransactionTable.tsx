import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
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

const typeIcons = {
  tip: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  payment: CreditCard,
};

const typeLabels = {
  tip: 'Tip',
  withdrawal: 'Withdrawal',
  payment: 'Payment',
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
    <Table>
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
          const isIncoming = transaction.type === 'tip' || transaction.type === 'payment';

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
                <p className="text-sm">{transaction.description || 'N/A'}</p>
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
  );
}
