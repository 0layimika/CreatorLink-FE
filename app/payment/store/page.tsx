'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function StorePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const type = searchParams.get('type');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [downloadTokens, setDownloadTokens] = useState<Array<{ token: string; product_id?: number | null }>>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError('No payment reference found');
        setStatus('failed');
        return;
      }

      try {
        let response: any;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          response = await storeApi.verifyPurchase(reference);
          if (response?.data?.status !== 'pending') break;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (response.success && response.data) {
          const payload: any = response.data;
            if (payload.status === 'paid') {
              setStatus('success');
              const orderResponse = await storeApi.getOrder(reference);
      if (orderResponse.success) setOrder((orderResponse.data as any)?.order || orderResponse.data);
              if (payload.download_token) {
                setDownloadToken(payload.download_token);
              }
              if (Array.isArray(payload.download_tokens)) {
                setDownloadTokens(payload.download_tokens.map((t: any) => ({ token: t.token, product_id: t.product_id })));
              }
            } else if (payload.status === 'failed') {
            setStatus('failed');
            setError('Payment was not successful');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('failed');
          setError(response.message || 'Failed to verify payment');
        }
      } catch (err) {
        setStatus('failed');
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [reference]);

  const handleDownload = async (token?: string) => {
    const activeToken = token || downloadToken;
    if (!activeToken) return;
    setDownloadLoading(true);
    try {
      const response = await storeApi.download(activeToken);
      if (response.success && response.data) {
        const data: any = response.data;
        setDownloadUrl(data.file_url);
        if (data.file_url) {
          window.location.href = data.file_url;
        }
      } else {
        throw new Error(response.message || 'Download failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-md shadow-medium">
        <CardContent className="p-8">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Verifying Payment
              </h2>
              <p className="text-sm text-text-secondary">
                Please wait while we confirm your payment...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful
              </h2>
              <p className="text-sm text-text-secondary mb-6">Your order has been confirmed.</p>
              {order && <div className="mb-6 rounded-2xl border border-border bg-background p-4 text-left text-sm"><div className="flex items-start justify-between gap-4 border-b border-border pb-3"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">Order receipt</p><p className="mt-1 break-all font-mono text-xs font-bold">{order.reference || reference}</p></div><span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-black text-success">Paid</span></div>{Array.isArray(order.items) && order.items.length > 0 && <div className="space-y-2 border-b border-border py-3">{order.items.map((item: any) => <div key={item.id || `${item.product_id}-${item.title_snapshot}`} className="flex justify-between gap-4"><span>{item.title_snapshot || item.title} × {item.quantity}</span><span className="shrink-0 font-semibold">{formatCurrency(Number(item.line_total || 0), order.currency || 'NGN')}</span></div>)}</div>}<div className="space-y-2 py-3"><div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{formatCurrency(Number(order.subtotal || 0), order.currency || 'NGN')}</span></div><div className="flex justify-between"><span className="text-text-secondary">Platform fee</span><span>{formatCurrency(Number(order.platform_fee) > 0 ? order.platform_fee : Number(order.platform_fee_minor || 0) / 100, order.currency || 'NGN')}</span></div><div className="flex justify-between border-t border-border pt-2 text-base font-black"><span>Total</span><span>{formatCurrency(Number(order.total || order.amount || 0), order.currency || 'NGN')}</span></div></div>{order.buyer_name && <div className="border-t border-border pt-3 text-xs text-text-secondary"><p>Delivered to</p><p className="mt-1 font-semibold text-foreground">{order.buyer_name}</p>{order.delivery_address?.address && <p className="mt-1">{order.delivery_address.address}</p>}</div>}</div>}
              {downloadToken && (
                <Button onClick={() => { void handleDownload(); }} disabled={downloadLoading} className="w-full shadow-soft">
                  {downloadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download
                </Button>
              )}
              {downloadTokens.length > 1 && (
                <div className="space-y-2">
                  {downloadTokens.map((token, idx) => (
                    <Button key={`${token.token}-${idx}`} variant="outline" onClick={() => { void handleDownload(token.token); }} className="w-full">
                      Download item {idx + 1}
                    </Button>
                  ))}
                </div>
              )}
              <div className="space-y-3 mt-4">
                {reference && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/order?reference=${reference}`)}
                    className="w-full"
                  >
                    View Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center py-8">
              <div className="h-20 w-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-error" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Failed
              </h2>
              <p className="text-text-secondary mb-6">
                {error || 'Your payment could not be processed. Please try again.'}
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full shadow-soft"
              >
                Go to Homepage
              </Button>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Payment Pending
              </h2>
              <p className="text-text-secondary mb-6">
                Your payment is being processed. Please check back in a few moments.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full shadow-soft"
              >
                Go to Homepage
              </Button>
            </div>
          )}

          {reference && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-text-secondary text-center">
                Reference: <span className="font-mono">{reference}</span>
              </p>
              {type && (
                <p className="text-xs text-text-secondary text-center mt-1">
                  Type: <span className="font-mono">{type}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StorePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="w-full max-w-md shadow-medium">
          <CardContent className="p-8">
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Loading...
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <StorePaymentContent />
    </Suspense>
  );
}
