import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Edit2, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

interface BankAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}

interface WalletCardProps {
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  bankAccount?: BankAccount | null;
  onAddBank?: () => void;
  onEditBank?: () => void;
  onWithdraw?: () => void;
}

export function WalletCard({ balance, bankAccount, onAddBank, onEditBank, onWithdraw }: WalletCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-soft">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-text-secondary">Available Balance</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {formatCurrency(balance.available, balance.currency)}
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
        <Clock className="h-4 w-4" />
        <span>
          {formatCurrency(balance.pending, balance.currency)} pending
        </span>
      </div>

      {bankAccount && bankAccount.account_number ? (
        <div className="mb-4 p-4 rounded-lg bg-card border border-border">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-foreground">Bank Account</span>
            </div>
            {onEditBank && (
              <button
                onClick={onEditBank}
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-foreground font-medium">{bankAccount.account_name}</p>
          <p className="text-xs text-text-secondary">{bankAccount.bank_name}</p>
          <p className="text-xs text-text-secondary mt-1">
            {bankAccount.account_number.replace(/\d(?=\d{4})/g, '*')}
          </p>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-lg bg-card/50 border border-border/50 text-center">
          <p className="text-sm text-text-secondary mb-2">No bank account set</p>
          {onAddBank && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddBank}
              className="w-full"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          )}
        </div>
      )}

      <Button 
        className="w-full shadow-soft" 
        disabled={!bankAccount || balance.available <= 0}
        onClick={onWithdraw}
      >
        <ArrowDownLeft className="h-4 w-4 mr-2" />
        Withdraw
      </Button>
    </Card>
  );
}
