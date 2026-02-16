'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';

function StorePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const type = searchParams.get('type');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError('No payment reference found');
        setStatus('failed');
        return;
      }

      try {
        const response = await storeApi.verifyPurchase(reference);
        if (response.success && response.data) {
          const payload: any = response.data;
          if (payload.status === 'paid') {
            setStatus('success');
            if (payload.download_token) {
              setDownloadToken(payload.download_token);
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

  const handleDownload = async () => {
    if (!downloadToken) return;
    setDownloadLoading(true);
    try {
      const response = await storeApi.download(downloadToken);
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
              <p className="text-sm text-text-secondary mb-6">
                Your order has been confirmed.
              </p>
              {downloadToken && (
                <Button onClick={handleDownload} disabled={downloadLoading} className="w-full shadow-soft">
                  {downloadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download
                </Button>
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
