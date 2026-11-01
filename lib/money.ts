import type { Money, WalletTransaction } from '@/types/wallet';
import type { Transaction } from '@/types';

export function moneyNumber(value: Money | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

// Allow an unfinished decimal while typing; validate the final value separately.
export function isMoneyInput(value: string): boolean {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

export function validMoneyAmount(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function mapTransaction(row: WalletTransaction): Transaction {
  return {
    id: String(row.id),
    type: row.type === 'gift' ? 'tip' : row.type === 'store' ? 'payment' : row.type,
    amount: moneyNumber(row.amount),
    currency: row.currency,
    description: row.description || '',
    status: row.status,
    createdAt: row.created_at,
    reference: row.reference,
    sender_name: row.sender_name || undefined,
    sender_email: row.sender_email || undefined,
    metadata: row.metadata,
  };
}

export function isCredit(type: Transaction['type']): boolean {
  return type === 'tip' || type === 'payment';
}
