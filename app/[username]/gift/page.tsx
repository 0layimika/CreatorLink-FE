'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { giftApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { isMoneyInput, validMoneyAmount } from '@/lib/money';
import type { Currency } from '@/types/wallet';

const limits = {
  USD: { min: 1, max: 100, presets: [1, 5, 10, 25] },
  NGN: { min: 1000, max: 100000, presets: [1000, 2500, 5000, 10000] },
};

export default function GiftPage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const { min, max, presets } = limits[currency];
  const value = validMoneyAmount(amount);
  const amountError = amount && (value === null ? 'Enter a valid amount with up to two decimal places.' : value < min || value > max ? `Enter an amount between ${formatCurrency(min, currency)} and ${formatCurrency(max, currency)}.` : '');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    if (value === null || value < min || value > max) {
      setError(`Enter an amount between ${formatCurrency(min, currency)} and ${formatCurrency(max, currency)}.`);
      return;
    }
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await giftApi.sendGift({ creatorUsername: username, amount: value, currency, sender_email: email.trim(), sender_name: name.trim() || undefined, description: message || undefined });
      if (!response.data?.authorization_url) throw new Error('Could not start gift checkout');
      window.location.assign(response.data.authorization_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start gift checkout');
      setLoading(false);
      submitting.current = false;
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ec] px-4 py-8 text-foreground sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-lg">
        <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-text-secondary"><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="rounded-[28px] border border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white"><Heart className="h-7 w-7" /></div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-primary">A little love</p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.055em]">Send a gift</h1>
            <p className="mt-3 text-sm text-text-secondary">Support @{username} with a gift to their {currency} wallet.</p>
          </div>
          {error && <div role="alert" className="mt-6 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>}
          <form onSubmit={submit} className="mt-7">
            <fieldset disabled={loading} className="space-y-4">
              <label className="block text-sm font-bold">Gift currency
                <select value={currency} onChange={(event) => { setCurrency(event.target.value as Currency); setAmount(''); setError(''); }} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3"><option value="NGN">NGN</option><option value="USD">USD</option></select>
              </label>
              <div className="grid grid-cols-2 gap-3">{presets.map((preset) => <button type="button" key={preset} onClick={() => { setAmount(String(preset)); setError(''); }} className={`rounded-xl border p-3 text-sm font-black ${amount === String(preset) ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}>{formatCurrency(preset, currency)}</button>)}</div>
              <Input label={`Amount (${currency})`} type="text" inputMode="decimal" required value={amount} onChange={(event) => { if (isMoneyInput(event.target.value)) { setAmount(event.target.value); setError(''); } }} error={amountError || undefined} helperText={`Per gift: ${formatCurrency(min, currency)}–${formatCurrency(max, currency)}. Up to two decimal places.`} />
              <Input label="Your name (optional)" value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="Your email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <Textarea label="Message (optional)" rows={3} maxLength={200} helperText={`${message.length}/200 characters`} value={message} onChange={(event) => setMessage(event.target.value)} />
            </fieldset>
            <Button type="submit" className="mt-6 w-full" isLoading={loading} disabled={value === null || Boolean(amountError) || !email.trim()}><Heart className="h-4 w-4" />Continue to payment</Button>
            <p className="mt-3 text-center text-xs text-text-secondary">Payments are securely handled by Bachs.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
