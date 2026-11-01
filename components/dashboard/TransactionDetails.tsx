import type { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function money(value: unknown): value is string | number {
  return (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) || (typeof value === 'number' && Number.isFinite(value));
}

export function TransactionDetails({ transaction, expanded = false }: { transaction: Transaction; expanded?: boolean }) {
  const metadata = transaction.metadata;
  if (!metadata) return null;
  const sourceId = metadata.gift_transaction_id ?? metadata.withdrawal_transaction_id;
  const sourceReference = metadata.gift_reference;
  const settlement = isRecord(metadata.wallet_settlement) ? metadata.wallet_settlement : null;
  const isWithdrawal = transaction.type === 'withdrawal';
  const hasDetails = transaction.type === 'fee' && sourceId != null || isWithdrawal && Object.keys(metadata).length > 0;

  return <div className="mt-1 space-y-1 text-xs text-text-secondary">
    {transaction.status === 'completed' && settlement?.status === 'pending' && <p>Payment received · Settlement pending{typeof settlement.release_at === 'string' && !Number.isNaN(Date.parse(settlement.release_at)) ? ` · Scheduled release ${formatDateTime(settlement.release_at)}` : ''}</p>}
    {transaction.status === 'completed' && settlement?.status === 'available' && <p>Available</p>}
    {hasDetails && <details open={expanded || undefined}><summary className={expanded ? 'hidden' : 'cursor-pointer font-semibold text-primary'}>View details</summary><dl className="mt-2 space-y-1">
      {transaction.type === 'fee' && sourceId != null && <div><dt className="inline">For transaction: </dt><dd className="inline">#{String(sourceId)}{typeof sourceReference === 'string' ? ` · ${sourceReference}` : ''}</dd></div>}
      {isWithdrawal && <>
        {money(metadata.fee) && <div><dt className="inline">Fee: </dt><dd className="inline">{formatCurrency(metadata.fee, transaction.currency)}</dd></div>}
        {money(metadata.total_debit) && <div><dt className="inline">Total wallet debit: </dt><dd className="inline">{formatCurrency(metadata.total_debit, transaction.currency)}</dd></div>}
        {money(metadata.receive_amount) && typeof metadata.receive_currency === 'string' && ['NGN', 'USD'].includes(metadata.receive_currency) && <div><dt className="inline">Bank receiving amount: </dt><dd className="inline">{formatCurrency(metadata.receive_amount, metadata.receive_currency)}</dd></div>}
        {money(metadata.exchange_rate) && <div><dt className="inline">Exchange rate: </dt><dd className="inline">{String(metadata.exchange_rate)}</dd></div>}
        {typeof metadata.bank_name === 'string' && <div><dt className="inline">Bank: </dt><dd className="inline">{metadata.bank_name}</dd></div>}
        {typeof metadata.account_name === 'string' && <div><dt className="inline">Account name: </dt><dd className="inline">{metadata.account_name}</dd></div>}
        {typeof metadata.account_number === 'string' && <div><dt className="inline">Account: </dt><dd className="inline">{metadata.account_number.replace(/\d(?=\d{4})/g, '*')}</dd></div>}
      </>}
    </dl></details>}
  </div>;
}
