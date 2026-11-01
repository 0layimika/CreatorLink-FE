'use client';

import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '@/lib/api';
import type { Transaction } from '@/types';
import type { Currency } from '@/types/wallet';
import { mapTransaction, moneyNumber } from '@/lib/money';

interface WalletData {
    wallets: Array<{ id: number; balance: number; pending_balance: number; currency: Currency }>;
}

interface Bank {
    code: string;
    name: string;
}

interface BankAccount {
    id: number;
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
    recipient_code: string | null;
    provider: string | null;
}

interface UseWalletReturn {
    wallet: WalletData | null;
    transactions: Transaction[];
    banks: Bank[];
    bankAccount: BankAccount | null;
    isLoading: boolean;
    error: string | null;
    setBankAccount: (data: { account_number: string; bank_code: string; account_name: string }) => Promise<void>;
    resolveAccount: (accountNumber: string, bankCode: string) => Promise<{ account_name: string }>;
    loadBanks: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useWallet({ includeBanks = false }: { includeBanks?: boolean } = {}): UseWalletReturn {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [bankAccount, setBankAccountState] = useState<BankAccount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = useCallback(async () => {
        setError(null);
        try {
            const [walletRes, transactionsRes, bankAccountRes] = await Promise.all([
                walletApi.getBalance(),
                walletApi.getTransactions({ limit: 10 }),
                walletApi.getBankAccount().catch(() => ({ success: false, data: null })), // Don't fail if no bank account
            ]);

            if (walletRes.success && walletRes.data) {
                setWallet({
                    wallets: (walletRes.data.wallets ?? [{
                        id: 0, currency: 'NGN' as const, balance: walletRes.data.balance,
                        pending_balance: walletRes.data.pending_balance,
                    }]).map((entry) => ({ ...entry, balance: moneyNumber(entry.balance), pending_balance: moneyNumber(entry.pending_balance) })),
                });
            }

            if (transactionsRes.success && transactionsRes.data && Array.isArray(transactionsRes.data)) {
                setTransactions(transactionsRes.data.map(mapTransaction));

            } else {
                setTransactions([]);
            }

            if (bankAccountRes.success && bankAccountRes.data) {
                const accountData = bankAccountRes.data;
                if (accountData.account_number || accountData.account_name) {
                    setBankAccountState(accountData);
                } else {
                    setBankAccountState(null);
                }
            } else {
                setBankAccountState(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchBanks = useCallback(async () => {
        try {
            const response = await walletApi.getBanks();
            if (response.success && response.data) {
                setBanks(response.data);
            }
        } catch {
            // Banks fetch failed silently
        }
    }, []);

    useEffect(() => {
        void fetchWallet();
        if (includeBanks) void fetchBanks();
    }, [fetchWallet, fetchBanks, includeBanks]);

    useEffect(() => {
        const onFocus = () => { void fetchWallet(); };
        const onVisible = () => { if (document.visibilityState === 'visible') onFocus(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [fetchWallet]);

    const setBankAccount = useCallback(async (data: { account_number: string; bank_code: string; account_name: string }) => {
        const response = await walletApi.setBankAccount(data);
        if (!response.success) {
            throw new Error(response.message || 'Failed to set bank account');
        }
        // Refresh bank account after setting
        const bankAccountRes = await walletApi.getBankAccount();
        if (bankAccountRes.success && bankAccountRes.data) {
            setBankAccountState(bankAccountRes.data as BankAccount);
        }
    }, []);

    const resolveAccount = useCallback(async (accountNumber: string, bankCode: string) => {
        const response = await walletApi.resolveAccount(accountNumber, bankCode);
        if (response.success && response.data) {
            return response.data as { account_name: string };
        }
        throw new Error(response.message || 'Failed to resolve account');
    }, []);

    return {
        wallet,
        transactions,
        banks,
        bankAccount,
        isLoading,
        error,
        setBankAccount,
        resolveAccount,
        loadBanks: fetchBanks,
        refetch: fetchWallet,
    };
}
