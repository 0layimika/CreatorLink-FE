export type Currency = 'NGN' | 'USD';
export type Money = string | number;
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'gift' | 'withdrawal' | 'store' | 'fee';

export interface Wallet {
  id: number;
  creator_id?: number;
  currency: Currency;
  balance: Money;
  pending_balance: Money;
  created_at?: string;
  updated_at?: string;
}

export interface WalletBalanceResponse {
  balance: Money;
  pending_balance: Money;
  currency: Currency;
  wallets: Wallet[];
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  type: TransactionType;
  amount: Money;
  currency: Currency;
  status: TransactionStatus;
  reference: string;
  provider: string;
  provider_reference: string | null;
  description: string | null;
  sender_name: string | null;
  sender_email: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalQuote {
  quote_id: string;
  amount: string;
  currency: Currency;
  fee: string;
  fee_currency: Currency;
  total_debit: string;
  receive_amount: string;
  receive_currency: Currency;
  exchange_rate: Money | null;
  expires_at: string;
  balance: Money;
  pending_balance: Money;
  sufficient_balance: boolean;
  bank_account: {
    bank_name: string;
    account_name: string;
    account_last_four: string;
  };
}

export interface WithdrawalResult extends Omit<WithdrawalQuote, 'balance' | 'pending_balance' | 'sufficient_balance' | 'bank_account'> {
  transaction_id: number;
  reference: string;
  status: TransactionStatus;
}

export interface HistoryParams {
  limit?: number;
  offset?: number;
  type?: TransactionType;
}
