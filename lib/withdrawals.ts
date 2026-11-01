import { walletApi } from '@/lib/api';
import type { WalletTransaction } from '@/types/wallet';

export interface WithdrawalIdentity {
  quote_id: string;
  transaction_id?: number;
  reference?: string;
}

export function quoteIsCurrent(expiresAt: string, now = Date.now()): boolean {
  return Date.parse(expiresAt) - now > 2000;
}

// Search mixed-currency pages. Absence is deliberately not interpreted as failure.
export async function findWithdrawal(identity: WithdrawalIdentity, signal?: AbortSignal): Promise<WalletTransaction | undefined> {
  const limit = 50;
  for (let offset = 0; offset < 1000; offset += limit) {
    const response = await walletApi.getWithdrawals({ limit, offset }, signal);
    if (!Array.isArray(response.data)) throw new Error('Could not read withdrawal history. Please retry checking the status.');
    const match = response.data.find((row) => row.id === identity.transaction_id || Boolean(identity.reference && row.reference === identity.reference) || row.metadata?.quote_id === identity.quote_id);
    if (match) return match;
    if (response.data.length < limit) return undefined;
  }
  return undefined;
}
