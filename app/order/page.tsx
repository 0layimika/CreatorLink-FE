'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { storeApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { StoreOrder } from '@/types';

function OrderContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const [downloadTokens, setDownloadTokens] = useState<string[]>([]);
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
          setDownloadTokens(Array.isArray(data.download_tokens) ? data.download_tokens.map((t: any) => t.token) : []);
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

  const handleDownload = async (token?: string) => {
    const activeToken = token || downloadToken;
    if (!activeToken) return;
    setDownloadLoading(true);
    try {
      const response = await storeApi.download(activeToken);
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

  const orderStatus = orderData.status as StoreOrder['status'];
  const paid = ['paid', 'confirmed', 'processing', 'shipped', 'delivered'].includes(orderStatus);
  const steps = ['paid', 'confirmed', 'processing', 'delivered'];
  const currentStep = orderStatus === 'shipped' ? 2 : steps.indexOf(orderStatus);
  const statusCopy = ({
    paid: { title: 'Payment received.', body: 'The creator has your order and will confirm it shortly.' },
    confirmed: { title: 'Order confirmed.', body: 'Your order has been reviewed and is ready for fulfilment.' },
    processing: { title: 'Order in progress.', body: 'The creator is preparing your order now.' },
    shipped: { title: 'Order in progress.', body: 'Your order is on its way.' },
    delivered: { title: 'Order delivered.', body: 'Your order has been marked as delivered.' },
  } as Partial<Record<StoreOrder['status'], { title: string; body: string }>>)[orderStatus];

  return (
    <div className="min-h-screen bg-[#f7f4ec] px-4 py-8 text-foreground sm:py-12">
      <Card className="mx-auto w-full max-w-2xl overflow-hidden border-ink shadow-[6px_6px_0_var(--ink)]">
        <CardContent className="p-0">
          <div className={`p-6 sm:p-8 ${paid ? 'bg-secondary text-ink' : 'bg-error text-white'}`}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] opacity-65">LinkVerse receipt</p><h1 className="mt-3 font-display text-3xl font-black tracking-[-0.05em] sm:text-4xl">{paid ? statusCopy?.title : 'Order needs attention.'}</h1><p className="mt-2 text-sm font-semibold opacity-75">{paid ? statusCopy?.body : 'This order is not currently payable.'}</p></div>{paid ? <CheckCircle className="h-10 w-10 shrink-0" /> : <XCircle className="h-10 w-10 shrink-0" />}</div>
            <div className="mt-7 grid grid-cols-4 gap-3">{steps.map((step, index) => <div key={step} className="min-w-0 text-center"><div className={`mx-auto h-2 w-full rounded-full ${index <= currentStep && paid ? 'bg-ink' : 'bg-black/15'}`} /><p className="mt-2 truncate text-[9px] font-black uppercase tracking-[0.1em] opacity-65 sm:text-[10px]">{step}</p></div>)}</div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.13em] text-text-secondary">Order reference</p><p className="mt-1 break-all font-mono text-sm font-bold">{orderData.reference}</p></div><span className="rounded-full border border-border px-3 py-1 text-xs font-black capitalize">{orderData.status}</span></div>
            <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs font-black uppercase tracking-[0.13em] text-text-secondary">Items</p><div className="mt-3 space-y-3">{(orderData.items?.length ? orderData.items : [{ title_snapshot: orderData.product?.title || 'Order', quantity: 1, line_total: orderData.subtotal ?? orderData.amount }]).map((item: any, index: number) => <div key={item.id || index} className="flex justify-between gap-4 text-sm"><span>{item.title_snapshot || item.title} × {item.quantity}</span><span className="font-semibold">{formatCurrency(Number(item.line_total || 0), orderData.currency || 'NGN')}</span></div>)}</div></div>
            <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{formatCurrency(Number(orderData.subtotal ?? orderData.amount ?? 0), orderData.currency || 'NGN')}</span></div><div className="flex justify-between"><span className="text-text-secondary">Platform fee</span><span>{formatCurrency(Number(orderData.platform_fee) || Number(orderData.platform_fee_minor || 0) / 100, orderData.currency || 'NGN')}</span></div><div className="flex justify-between border-t border-border pt-3 text-lg font-black"><span>Total paid</span><span>{formatCurrency(Number(orderData.total ?? orderData.amount ?? 0), orderData.currency || 'NGN')}</span></div></div>
            <div className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-[0.13em] text-text-secondary">Buyer</p><p className="mt-1 font-semibold">{orderData.buyer_name || '—'}</p><p className="text-text-secondary">{orderData.buyer_email}</p></div><div><p className="text-xs font-black uppercase tracking-[0.13em] text-text-secondary">Delivery</p><p className="mt-1 font-semibold">{orderData.delivery_address?.address || 'Address on order'}</p></div></div>

          {downloadToken && orderData.status === 'paid' && (
            <Button onClick={() => { void handleDownload(); }} disabled={downloadLoading} className="w-full shadow-soft">
              {downloadLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download
            </Button>
          )}
          {downloadTokens.length > 1 && orderData.status === 'paid' && (
            <div className="space-y-2">
              {downloadTokens.map((token, idx) => (
                <Button key={`${token}-${idx}`} variant="outline" onClick={() => { void handleDownload(token); }} className="w-full">
                  Download item {idx + 1}
                </Button>
              ))}
            </div>
          )}
          </div>
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
