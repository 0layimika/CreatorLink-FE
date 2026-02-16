'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';

function OrderContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!reference) {
        setError('Order reference is required');
        setLoading(false);
        return;
      }
      try {
        const res = await storeApi.getOrder(reference);
        if (res.success && res.data) {
          const data: any = res.data;
          setOrderData(data.order);
          setDownloadToken(data.download_token || null);
        } else {
          throw new Error(res.message || 'Failed to load order');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [reference]);

  const handleDownload = async () => {
    if (!downloadToken) return;
    setDownloadLoading(true);
    try {
      const response = await storeApi.download(downloadToken);
      if (response.success && response.data) {
        const data: any = response.data;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{error || 'Order not found'}</p>
      </div>
    );
  }

  const statusIcon =
    orderData.status === 'paid' ? (
      <CheckCircle className="h-6 w-6 text-success" />
    ) : (
      <XCircle className="h-6 w-6 text-error" />
    );

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-medium">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            {statusIcon}
            <div>
              <h2 className="text-xl font-semibold text-foreground">Order Status</h2>
              <p className="text-text-secondary capitalize">{orderData.status}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm text-text-secondary">
            {orderData.product?.title && (
              <p>Product: {orderData.product.title}</p>
            )}
            <p>Reference: <span className="font-mono">{orderData.reference}</span></p>
            <p>Amount: ₦{Number(orderData.amount).toLocaleString()}</p>
            <p>Buyer Email: {orderData.buyer_email}</p>
          </div>

          {downloadToken && orderData.status === 'paid' && (
            <Button onClick={handleDownload} disabled={downloadLoading} className="w-full shadow-soft">
              {downloadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
