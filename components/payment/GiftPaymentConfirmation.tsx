'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Heart, Loader2, CircleHelp } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { giftApi } from '@/lib/api';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  // This merchant reference comes from the return URL, never initiation's checkout ID.
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState<'confirming' | 'completed' | 'unconfirmed' | 'error'>('confirming');
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    setStatus('confirming');
    setError(null);
    const verify = async () => {
      if (!reference) {
        setError('No payment reference was included in this return link.');
        setStatus('error');
        return;
      }
      try {
        const response = await giftApi.verifyGift(reference, controller.signal);
        if (!active) return;
        if (response.data?.status === 'completed') {
          setStatus('completed');
          return;
        }
        if (response.data?.status !== 'pending') throw new Error('The payment status could not be confirmed. Please check again.');
        attempts += 1;
        if (attempts >= 8) {
          setStatus('unconfirmed');
          return;
        }
        timer = setTimeout(verify, Math.min(1500 * 1.7 ** attempts, 10000));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not check the payment status.');
        setStatus('error');
      }
    };
    void verify();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [reference, retry]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardContent className="p-8 text-center">
          {status === 'completed' ? <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"><CheckCircle className="h-12 w-12 text-success" /></div>
            <Heart className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h1 className="mb-2 text-2xl font-bold">Thank you!</h1>
            <p className="mb-6 text-text-secondary">Your gift payment has been confirmed. Thank you for supporting this creator.</p>
          </> : <div aria-live="polite">
            {status === 'confirming' ? <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" /> : <CircleHelp className="mx-auto mb-4 h-16 w-16 text-primary" />}
            <h1 className="mb-2 text-xl font-bold">{status === 'confirming' ? 'Confirming your payment' : status === 'unconfirmed' ? 'Still awaiting confirmation' : 'Unable to confirm payment'}</h1>
            <p className="mb-6 text-sm text-text-secondary">{status === 'confirming' ? 'Please wait while we check your payment with the server.' : status === 'unconfirmed' ? 'Your payment is still pending confirmation. Automatic checks have paused. You can check its status again; this does not mean the payment failed.' : error}</p>
            {status !== 'confirming' && reference && <Button type="button" className="mb-3 w-full" onClick={() => setRetry((value) => value + 1)}>Check payment status again</Button>}
          </div>}
          <ButtonLink href="/" variant="outline" className="w-full">Go to homepage</ButtonLink>
          {reference && <p className="mt-6 break-all border-t border-border pt-6 text-xs text-text-secondary">Reference: <span className="font-mono">{reference}</span></p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function GiftPaymentConfirmation() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 aria-label="Loading payment status" className="h-8 w-8 animate-spin text-primary" /></div>}><ConfirmationContent /></Suspense>;
}
