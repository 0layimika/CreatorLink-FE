import type { Currency, Money, Wallet, WalletTransaction } from './wallet';

export interface AdminOverview {
  users: { total: number; active: number; blocked: number; verified: number };
  wallets: { currency: Currency; available: Money; pending: Money; total: Money; wallets: string }[];
  pending_releases: number;
}
export interface AdminUser {
  id: number;
  email: string;
  verified: boolean;
  is_blocked: boolean;
  is_admin: boolean;
  created_at: string;
  creator_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  wallets: Wallet[];
}
export interface AdminOwner {
  user_id: number;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}
export type AdminTransaction = WalletTransaction & AdminOwner;
export interface AdminRelease extends AdminOwner {
  id: string;
  wallet_id: number;
  transaction_id: number;
  amount: Money;
  currency: Currency;
  release_at: string;
  reference: string;
  type: string;
}
export interface AdminAudit {
  id: string;
  action: string;
  target_id: string;
  reason: string;
  actor_email: string;
  created_at: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}
export interface AdminPage<T> { items: T[]; total: number; limit: number; offset: number }
export interface AdminQuery { limit?: number; offset?: number; search?: string; status?: string; currency?: string; user_id?: number }
export interface AdminOperation { request_id: string; reason: string }
