'use client';

import { useState, useEffect, useCallback } from 'react';
import { walletApi } from '@/lib/api';

interface WalletData {
    balance: number;
    pending: number;
    currency: string;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string;
    status: string;
    createdAt: string;
    reference?: string;
    sender_name?: string;
    sender_email?: string;
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
    withdraw: (amount: number) => Promise<void>;
    setBankAccount: (data: { account_number: string; bank_code: string; account_name: string }) => Promise<void>;
    resolveAccount: (accountNumber: string, bankCode: string) => Promise<{ account_name: string }>;
    refetch: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [bankAccount, setBankAccountState] = useState<BankAccount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [walletRes, transactionsRes, bankAccountRes] = await Promise.all([
                walletApi.getBalance(),
                walletApi.getTransactions({ limit: 10 }),
                walletApi.getBankAccount().catch(() => ({ success: false, data: null })), // Don't fail if no bank account
            ]);

            if (walletRes.success && walletRes.data) {
                setWallet(walletRes.data);
            }

            if (transactionsRes.success && transactionsRes.data && Array.isArray(transactionsRes.data)) {
                const mappedTransactions: Transaction[] = transactionsRes.data.map((t) => ({
                    id: t.id.toString(),
                    type: t.type === 'gift' ? 'tip' : (t.type === 'withdrawal' ? 'withdrawal' : 'payment'),
                    amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
                    currency: t.currency,
                    description: t.description || '',
                    status: t.status as 'completed' | 'pending' | 'failed',
                    createdAt: t.created_at,
                    reference: t.reference,
                    sender_name: t.sender_name || undefined,
                    sender_email: t.sender_email || undefined,
                }));
                setTransactions(mappedTransactions);
            } else {
                setTransactions([]);
            }

            if (bankAccountRes.success && bankAccountRes.data) {
                const accountData = bankAccountRes.data as any;
                if (accountData.account_number || accountData.account_name) {
                    setBankAccountState(accountData as BankAccount);
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
        fetchWallet();
        fetchBanks();
    }, [fetchWallet, fetchBanks]);

    const withdraw = useCallback(async (amount: number) => {
        const response = await walletApi.withdraw(amount);
        if (response.success) {
            await fetchWallet();
        } else {
            throw new Error(response.message || 'Failed to initiate withdrawal');
        }
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
        withdraw,
        setBankAccount,
        resolveAccount,
        refetch: fetchWallet,
    };
}

