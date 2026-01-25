'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface Bank {
  code: string;
  name: string;
}

interface BankAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}

interface BankAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { account_number: string; bank_code: string; account_name: string }) => Promise<void>;
  onResolveAccount: (accountNumber: string, bankCode: string) => Promise<{ account_name: string }>;
  banks: Bank[];
  existingAccount?: BankAccount | null;
}

export function BankAccountForm({
  isOpen,
  onClose,
  onSave,
  onResolveAccount,
  banks,
  existingAccount,
}: BankAccountFormProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingAccount) {
        setAccountNumber(existingAccount.account_number);
        setBankCode(existingAccount.bank_code);
        setAccountName(existingAccount.account_name);
      } else {
        setAccountNumber('');
        setBankCode('');
        setAccountName('');
      }
      setError(null);
    }
  }, [isOpen, existingAccount]);

  const handleResolveAccount = async () => {
    if (!accountNumber || !bankCode) {
      setError('Please enter account number and select a bank');
      return;
    }

    setIsResolving(true);
    setError(null);
    try {
      const result = await onResolveAccount(accountNumber, bankCode);
      setAccountName(result.account_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve account number');
    } finally {
      setIsResolving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountNumber || !bankCode || !accountName) {
      setError('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        account_number: accountNumber,
        bank_code: bankCode,
        account_name: accountName,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bank account');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-soft w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">
          {existingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bank
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
            >
              <option value="">Select a bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Account Number"
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
            required
            disabled={isResolving || isSaving}
          />

          {accountNumber && bankCode && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResolveAccount}
              disabled={isResolving || isSaving}
              className="w-full"
            >
              {isResolving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                'Verify Account Number'
              )}
            </Button>
          )}

          <Input
            label="Account Name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account name will be auto-filled"
            required
            disabled={isResolving || isSaving}
          />

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isResolving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                existingAccount ? 'Update' : 'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

